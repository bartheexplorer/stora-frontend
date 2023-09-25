import type { PrismaClient } from "@prisma/client"
import type { CartsEntity, CreateOrderByCartParams, Free1Entity, ParamsCreateCart, QueryRawTf } from "./carts-interface"
import { createQrisRequest, createVaRequest, pushNotif } from "./order"
import { format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { notifOrder } from "./notif-order";

const generateNumberID = (length: number): string => {
    let result = ''
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10)
    }
    return result
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const generateCartId = (length: number): string => {
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

export async function createCarts(prisma: PrismaClient, params: ParamsCreateCart) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const num = generateNumberID(7)
            const cartId2 = generateNumberID(7)
            const cartId = generateCartId(16)

            let cartCode = ''

            const cartTemp = await tx.t_keranjang_temp.findFirst({
                where: {
                    session: { equals: params.session },
                },
            })

            if (cartTemp) {
                cartCode = cartTemp.kode_keranjang
            } else {
                cartCode = cartId
                await tx.t_keranjang_temp.create({
                    data: {
                        kode: Number(num),
                        session: params.session,
                        kode_keranjang: cartId,
                    },
                })
            }

            const createCart = await tx.t_keranjang.create({
                data: {
                    id_keranjang: Number(cartId2),
                    kode_keranjang: cartCode,
                    id_produk: params.productId,
                    nama_produk: params.productName,
                    harga_jual: params.price,
                    berat: params.weight,
                    gambar_produk: params.productImage,
                    jenis_produk: params.typeProduct,
                    qty: params.qty,
                    varian: params.variant,
                    ukuran: params.size,
                    kupon: params.coupon,
                    potongan: params.discount,
                    total: params.total,
                    id_user: params.userId,
                    is_free_ongkir: params.freeShipping ? 'SATU' : 'NOL',
                    is_free: params.productFree ? 'SATU' : 'NOL',
                },
            })

            return {
                createCart,
                cartCode,
                num,
                cartId2,
                cartId,
            }
        })

        return result
    } catch (error) {
        if (error instanceof Error) {
            console.log("address", error)
        }
        return null
    }
}

export async function getCart(
    prisma: PrismaClient,
    params: {
        cartId?: string
        userId?: string
    }
) {
    if (!params.cartId || !params.userId) return null
    try {
        const result = await prisma.$transaction(async (tx) => {
            const carts = await tx.$queryRaw<CartsEntity[]>`SELECT id_keranjang
        ,id_produk
        ,nama_produk
        ,if(berat = '0','',CONCAT('Berat : ', berat)) as berat_str
        ,if(berat = '0','', berat) as berat
        ,gambar_produk
        ,jenis_produk
        ,qty
        ,if(varian = '0','',CONCAT('Varian : ', varian)) as varian_str
        ,if(varian = '0','',varian) as varian
        ,if(ukuran = '0','',CONCAT('Ukuran : ', ukuran)) as ukuran_str
        ,if(ukuran = '0','',ukuran) as ukuran
        ,kupon
        ,potongan
        ,total
        ,is_free_ongkir
        FROM t_keranjang 
        WHERE kode_keranjang IN (SELECT kode_keranjang FROM t_keranjang_temp WHERE session = ${params.cartId}) 
        AND id_user = ${params.userId}`

            const free1 = await tx.$queryRaw<Free1Entity[]>`SELECT k.kode_keranjang 
          FROM t_keranjang k 
          JOIN t_produk p ON (k.id_produk=p.id_produk)
          WHERE p.is_free_ongkir = '0' 
          AND kode_keranjang IN (SELECT kode_keranjang FROM t_keranjang_temp WHERE session = ${params.cartId})
          AND k.id_user = ${params.userId}
          AND p.jenis_produk='fisik'
          GROUP BY k.kode_keranjang, p.is_free_ongkir
          ORDER BY p.is_free_ongkir ASC`

            const free2 = await tx.$queryRaw<Free1Entity[]>`SELECT k.kode_keranjang 
          FROM t_keranjang k 
          JOIN t_produk p ON (k.id_produk=p.id_produk)
          WHERE p.is_free_ongkir = '1' 
          AND kode_keranjang IN (SELECT kode_keranjang FROM t_keranjang_temp WHERE session = ${params.cartId})
          AND k.id_user = ${params.userId}
          AND p.jenis_produk='fisik'
          GROUP BY k.kode_keranjang,p.is_free_ongkir
          ORDER BY p.is_free_ongkir ASC`

            return { carts, free1, free2 }
        })
        return result
    } catch (error) {
        return null
    }
}

export async function updateCart(prisma: PrismaClient, idKeranjang: string, qty: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.$queryRaw<{ berat: number; potongan: number; total: number }[]>`SELECT 
          ((berat / qty) * ${qty}) as berat,
          ((potongan / qty) * ${qty}) as potongan,
          ((harga_jual * ${qty}) - ((potongan / qty) * ${qty})) as total 
          FROM t_keranjang WHERE id_keranjang = ${idKeranjang}`

            const berat = product[0]?.berat || 0
            const total = product[0]?.total || 0
            const potongan = product[0]?.potongan || 0

            const updateResult = await tx.$executeRaw`UPDATE t_keranjang SET berat = ${berat},
          qty = ${qty},
          potongan = ${potongan},
          total = ${total}
          WHERE id_keranjang = ${idKeranjang}`

            return updateResult
        })
        return result
    } catch (error) {
        return null
    }
}

export async function destroyCart(prisma: PrismaClient, idKeranjang: number) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            return await tx.t_keranjang.delete({
                where: {
                    id_keranjang: idKeranjang,
                },
            })
        })
        return result
    } catch (error) {
        null
    }
}

function formatInTimezone(): string {
    const originalDate = new Date();
    const targetTimezone = 'Asia/Jakarta'; // Replace with your desired timezone
    const dateFormat = 'yyyy-MM-dd HH:mm:ss';
    // Convert the date to the desired timezone
    const zonedDate = utcToZonedTime(originalDate, targetTimezone);
    
    // Format the date in the desired timezone
    const formattedDate = format(zonedDate, dateFormat);
    
    return formattedDate;
}

// Create order
export async function createOrderByCart(prisma: PrismaClient, params: CreateOrderByCartParams) {
    try {
        const result = await prisma.$transaction(async (tx) => {

            const generateRandomInt = (): number => {
                const min = -2147483648;
                const max = 2147483647;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const id_order_random = generateRandomInt()
            const tglOrder = formatInTimezone()
            console.log("tglOrder", tglOrder)
            // Text order
            let textOrder1: string
            let textOrder2: string
            // let textOrder3: string
            let textOrder4: string

            const cartTemp = await tx.$queryRaw<{ kode_keranjang: string }[]>`SELECT kode_keranjang FROM t_keranjang_temp WHERE session = ${params.cartId}`
            const cartId = cartTemp.find((_item, i) => i === 0)
            if (!cartId) throw new Error('Carti id tidak ditemukan')

            const carts = await tx.t_keranjang.findMany({
                where: {
                    kode_keranjang: { equals: cartId.kode_keranjang },
                },
            })

            // console.log("carts", carts)
            let _order_status  = "pending"
            let _jenis_produk  = "fisik"

            if (Array.isArray(carts) && carts.length === 1) {
                const _findFirst = carts.find((_, i) => (i === 0))
                if (_findFirst) {
                    if (_findFirst.jenis_produk === "digital") {
                        _order_status  = "selesai"
                    }
                    _jenis_produk = _findFirst.jenis_produk
                }
            }

            

            const total = carts.reduce((accumulate, item) => {
                const total = Number(accumulate + item.total)
                return Math.round(Number(total * item.qty))
            }, 0)
            // const totalBayar = Math.round(Number(total + params.ongkir))
            const totalBayar =  Number(params.totalbayar)
            const orderId = generateNumberID(16)
            const now = new Date()

            let accountBank = ''
            let paymentId = ''
            textOrder2 = '-'
            let textOrder3 = ""

            // Bayar
            async function paymentData() {
                textOrder3 += `Ongkir: *${formatCurrency(params.ongkir)}*`
                // Payment method
                if (params.paymentMethodCode === 'bank') {
                    const cekBank = await tx.t_bank.findFirst({
                        where: {
                            id_bank: { equals: parseInt(params.payment_id) },
                            id_user: { equals: params.id_user },
                        },
                    })
                    if (!cekBank) throw new Error('Bank tidak ditemukan')

                    accountBank = [cekBank.bank, cekBank.rekening].join(' - ')
                    paymentId = ""

                    textOrder2 = `Bank tujuan pembayaran: ${[cekBank.bank, cekBank.rekening].join(' ')} (${cekBank.pemilik})`
                } else if (params.paymentMethodCode === 'virtual') {
                    const dbVa = await tx.t_bank_va_xendit.findFirst({
                        where: {
                            id_user: { equals: params.id_user },
                            id_bank_va_xendit: { equals: parseInt(params.payment_id) },
                        },
                    })
                    if (!dbVa) throw new Error('Va tidak ditemukan')
                    const virtualData = await createVaRequest({
                        id_user: params.id_user.toString(),
                        totalbayar: params.totalbayar.toString(),
                        bank: dbVa.bank_code,
                        order_id: orderId,
                    })
                    accountBank = virtualData?.data ? virtualData.data : ''
                    paymentId = virtualData?.id ? virtualData.id : ""

                    textOrder2 = `Virtual Akun tujuan pembayaran: ${virtualData?.data}`
                } else if (params.paymentMethodCode === 'qris') {
                    const cekSettingXendit = await tx.t_setting_xendit.findFirst({
                        where: {
                            id_user: { equals: params.id_user },
                            status_qris: { equals: 'SATU' },
                        },
                    })
                    if (!cekSettingXendit) throw new Error('Setting xendit')

                    const dataCod = await createQrisRequest({
                        userId: cekSettingXendit.id.toString(),
                        amount: params.totalbayar.toString(),
                        permalink: params.permalink,
                        orderId: params.id_user.toString(),
                    })

                    accountBank = dataCod?.qr_string ? dataCod.qr_string : ""
                    paymentId = dataCod?.id ? dataCod.id : ""
                    textOrder2 = `link Qris tujan pembayaran: ${process.env.url}/${params.permalink}/order/qris?id=${orderId}`
                } else if (params.paymentMethodCode === 'cod') {
                    // if (params.typeProduct !== "fisik") throw new Error("payment not found");
                    accountBank = ""
                    paymentId = ""
                    textOrder2 = `COD`
                } else {
                    accountBank = ""
                    paymentId = ""
                    textOrder2 = ""
                    // throw new Error('payment not found')
                }
            }

            await paymentData()

            // console.log(`${orderId},
            // ${cartId.kode_keranjang},
            // ${params.nama},
            // ${params.hp},
            // ${params.email},
            // ${params.alamat},
            // ${params.provinsi},
            // ${params.kota},
            // ${params.kecamatan},
            // ${params.expedisi},
            // ${params.paket},
            // ${params.ongkir},
            // ${params.estimasi},
            // ${totalBayar},
            // ${accountBank},
            // ${params.paymentMethodCode},
            // ${'0'},
            // ${'1'},
            // ${now},
            // ${now},
            // ${params.id_user},
            // ${paymentId},
            //   "0000-00-00 00:00:00",
            //   "0000-00-00 00:00:00",
            // "0000-00-00 00:00:00"`)

            const createOrder = await tx.$executeRaw`INSERT INTO t_multi_order(
          order_id,
          kode_keranjang,
          nama_pembeli,
          no_hp_pembeli,
          email_pembeli,
          alamat_pembeli,
          prov,
          kab,
          kec,
          expedisi,
          paket,
          ongkir,
          estimasi,
          totalbayar,
          bank,
          payment,
          status_bayar,
          order_status,
          tgl_order,
          is_created,
          id_user,
          id_payment,
          tgl_proses,
            tgl_kirim,
        tgl_selesai
        )
        VALUES (
          ${orderId},
          ${cartId.kode_keranjang},
          ${params.nama},
          ${params.hp},
          ${params.email},
          ${params.alamat},
          ${params.provinsi},
          ${params.kota},
          ${params.kecamatan},
          ${params.expedisi},
          ${params.paket},
          ${params.ongkir},
          ${params.estimasi},
          ${totalBayar},
          ${accountBank},
          ${params.paymentMethodCode},
          ${'0'},
          ${'1'},
          ${now},
          ${now},
          ${params.id_user},
          ${paymentId},
            "0000-00-00 00:00:00",
            "0000-00-00 00:00:00",
          "0000-00-00 00:00:00"
        )`

            if (createOrder === 0) throw new Error('Gagal insert data')

            const product = await tx.$queryRaw<QueryRawTf[]>`SELECT 
          id_keranjang,
          id_produk,
          harga_jual,
          nama_produk,
          if(berat = '0','',CONCAT('Berat : ',berat)) as berat,
          gambar_produk,
          jenis_produk,
          qty,
          varian,
          ukuran,
          kupon,
          potongan,
          total,
          berat b
          FROM t_keranjang 
          WHERE kode_keranjang IN (SELECT kode_keranjang FROM t_keranjang_temp WHERE session = ${params.cartId}) 
          AND id_user = ${params.id_user}`

            let textOrder: string
            textOrder = ''

            for (let index = 0; index < product.length; index++) {
                const element = product[index];
                textOrder += `\nProduk yang dibeli *${element.nama_produk}*`
                if (element.varian.length !== 0) {
                    textOrder += `\nVariant: *${element.varian}*`
                }

                if (element.ukuran.length !== 0) {
                    textOrder += `\nUkuran: *${element.ukuran}*`
                }

                textOrder += `\nHarga: ${formatCurrency(element.harga_jual)}\nJumlah: *${element.qty}*`
            }


            const pesanStr = await tx.t_teks_pesan.findFirst({
                where: {
                    id_user: { equals: params.id_user },
                    status_order: { equals: 'order' },
                },
            })

            if (pesanStr) {
                const message = pesanStr.teks_pesan.replaceAll('{{ORDER_ID}}', orderId)
                    .replaceAll('{{DETAIL_PRODUK}}', textOrder)
                    .replaceAll('{{TOTAL_BAYAR}}', formatCurrency(totalBayar))
                    .replaceAll('{{METODE_PEMBAYARAN}}', textOrder2)
                    .replaceAll('{{NAMA_TOKO}}', params.permalink)
                    .replaceAll('{{EKSPEDISI}}', params.expedisi)
                    .replaceAll('{{TANGGAL_ORDER}}', tglOrder)
                    .replaceAll('{{NAMA_PEMBELI}}', params.nama)
                    .replaceAll('{{ALAMAT_PEMBELI}}', params.alamat)
                    .replaceAll('{{WHATSAPP_PEMBELI}}', params.hp)
                textOrder4 = message
            } else {
                const message = `Halo kak, saya baru saja melakukan pemesanan produk di *{{Nama_toko}}* dengan status pembayaran masih *TERTUNDA*\n\nBerikut detail pemesanan saya:\nNomor Invoice: {{Order_id}}\nNama: {{Nama_pembeli}}\nNomor Hp/WA: {{Nomor_pembeli}}\nAlamat: {{Alamat_pembeli}}\n\n{{Text_order}}\n\nSubTotal: *{{Sub_total}}*\n{{Text_order_ongkir}}\nPotongan: *{{Discount}}*\nTotal Bayar: *{{Total_bayar}}*\n\nTerima Kasih *{{Nama_pembeli}}*`
                textOrder4 = message.replaceAll('Nama_toko', params.permalink)
                    .replaceAll('Order_id', orderId)
                    .replaceAll('Nama_pembeli', params.nama)
                    .replaceAll('Nomor_pembeli', params.hp)
                    .replaceAll('Alamat_pembeli', params.alamat)
                    .replaceAll('Text_order', textOrder)
                    .replaceAll('Sub_total', formatCurrency(total))
                    .replaceAll('Text_order_ongkir', textOrder2)
                    .replaceAll('Discount', formatCurrency(0))
                    .replaceAll('Total_bayar', formatCurrency(totalBayar))
            }

            const clearCart = await tx.$executeRaw`DELETE FROM t_keranjang_temp WHERE session = ${params.cartId}`
            if (clearCart === 0) throw new Error('Gagal Membersihkan data')

            // const notip = await pushNotif(
            //     textOrder4,
            //     params.hp,
            //     params.id_user.toString()
            // )

            // let _statusOrder = "selesai"

            const _resNotif = await notifOrder({
                user_id: params.id_user.toString(),
                order_id: orderId,
                order_status: _order_status,
                jenis_produk: _jenis_produk,
            })

            console.log("_resNotif", _resNotif)

            console.log({
                user_id: params.id_user.toString(),
                order_id: orderId,
                order_status: _order_status,
                jenis_produk: _jenis_produk,
            })

            return {
                textOrder: textOrder4,
                notip: null,
                orderId,
                id_order_random: id_order_random.toString(),
            }
        })
        return result
    } catch (error) {
        if (error instanceof Error) {
            console.log(error)
        }
        return null
    }
}

function formatCurrency(amount: number): string {
    const formattedAmount = new Intl.NumberFormat('id-ID').format(amount)

    return formattedAmount
}