import type { PrismaClient, t_order as TOrder, t_multi_order } from "@prisma/client"
import { appConfig } from "../config/app"
import type { OrderParams } from "./order-interface"
import { format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

function formatCurrency(amount: number): string {
    const formattedAmount = new Intl.NumberFormat('id-ID').format(amount)

    return formattedAmount
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
  

export async function createOrder(prisma: PrismaClient, params: OrderParams) {
    try {
        const tglOrder = formatInTimezone()
        console.log("tglOrder", tglOrder)
        // Text order
        let textOrder1: string = `Produk Yg Dibeli: *${params.productName}*`
        let textOrder2: string = ''
        let textOrder3: string = ''
        let textOrder4: string = ''

        if (params.variant) {
            textOrder1 += `\n Varian: *${params.variant}*`
        }

        if (params.size) {
            textOrder1 += `\n Ukuran: *${params.size}*`
        }

        const result = await prisma.$transaction(async (tx) => {
            // Custom field
            const customFields: number[] = []
            // Save data custom field
            for (const iter of params.customFields) {
                const customField = await tx.t_data_custom_field.create({
                    data: {
                        order_id: params.orderId,
                        id_user: params.userId,
                        id_produk: params.productId,
                        id_custom_field: iter.idCustomField,
                        value: iter.value,
                    }
                })
                customFields.push(customField.id_data_custom_field)
                textOrder1 += `\n ${iter.label}: *${iter.value}*`
            }

            textOrder1 += `\n Harga: *${formatCurrency(params.totalbayar)} \n *Jumlah: *${params.qty}*`

            // const customFieldsData = customFields.join(',')
            const customFieldFirst = customFields.find((_item, index) => (index === 0))

            // Set account bank
            let paymentId: string | null = null
            let accountBank: string = ''

            async function paymentData() {
                textOrder3 += `\n Ongkir: *${formatCurrency(params.ongkir)}*`
                // Payment method
                if (params.paymentMethodCode === 'bank') {
                    const cekBank = await tx.t_bank.findFirst({
                        where: {
                            id_bank: { equals: params.paymentMethodId },
                            id_user: { equals: params.userId },
                        },
                    })
                    if (!cekBank) throw new Error('Bank tidak ditemukan')

                    accountBank = [cekBank.bank, cekBank.rekening].join(' - ')
                    paymentId = null

                    textOrder2 = `Bank tujuan pembayaran: ${[cekBank.bank, cekBank.rekening].join(' ')} (${cekBank.pemilik})`
                } else if (params.paymentMethodCode === 'virtual') {
                    const dbVa = await tx.t_bank_va_xendit.findFirst({
                        where: {
                            id_user: { equals: params.userId },
                            id_bank_va_xendit: { equals: params.paymentMethodId },
                        },
                    })
                    if (!dbVa) throw new Error('Va tidak ditemukan')
                    const virtualData = await createVaRequest({
                        id_user: params.userId.toString(),
                        totalbayar: params.totalbayar.toString(),
                        bank: dbVa.bank_code,
                        order_id: params.orderId,
                    })
                    accountBank = virtualData?.data ? virtualData.data : ''
                    paymentId = virtualData?.id ? virtualData.id : null

                    textOrder2 = `Virtual Akun tujuan pembayaran: ${virtualData?.data}`
                } else if (params.paymentMethodCode === 'qris') {
                    const cekSettingXendit = await tx.t_setting_xendit.findFirst({
                        where: {
                            id_user: { equals: params.userId },
                            status_qris: { equals: 'SATU' },
                        },
                    })
                    if (!cekSettingXendit) throw new Error('Setting xendit')

                    const dataCod = await createQrisRequest({
                        userId: cekSettingXendit.id.toString(),
                        amount: params.totalbayar.toString(),
                        permalink: params.permalink,
                        orderId: params.orderId,
                    })

                    accountBank = dataCod?.qr_string ? dataCod.qr_string : null
                    paymentId = dataCod?.id ? dataCod.id : null
                    textOrder2 = `link Qris tujan pembayaran: ${process.env.url}/${params.permalink}/order/qris?id=${params.orderId}`
                } else if (params.paymentMethodCode === 'cod') {
                    if (params.typeProduct !== "fisik") throw new Error("payment not found");
                    accountBank = ''
                    paymentId = null
                    textOrder2 = `COD`
                } else {
                    throw new Error('payment not found')
                }
            }

            if (params.typeProduct === 'fisik') {
                if (!params.isFree || !params.isFreeOngkir) {
                    await paymentData()
                }
            } else {
                if (!params.isFree) {
                    await paymentData()
                }
            }
            const order = await tx.$executeRaw`
          INSERT INTO t_order (
            order_id,
            id_produk,
            nama_pembeli,
            no_hp_pembeli,
            email_pembeli,
            alamat_pembeli,

            prov,
            kab,
            kec,
            
            qty,
            varian,
            ukuran,
            expedisi,
            paket,
            ongkir,
            estimasi,
            kupon,

            potongan,
            total,
            totalbayar,
            
            bank,
            payment,

            nama_produk,

            harga_jual,
            berat,

            gambar_produk,
            jenis_produk,

            status_bayar,
            order_status,
            
            tgl_order,
            is_created,
            
            id_user,
            id_custom_field,
            id_payment,

            tgl_proses,
            tgl_kirim,
            tgl_selesai
          )
        VALUES (
          ${params.orderId},
          ${params.productId},
          ${params.name},
          ${params.phone},
          ${params.email},
          ${params.address},

          ${params.province},
          ${params.city},
          ${params.subdistrict},
          
          ${params.qty},
          ${params.variant},
          ${params.size},
          ${params.expedisi},
          ${params.paket},
          ${params.ongkir},
          ${params.estimasi},
          ${params.kupon},

          ${params.potongan},
          ${params.total},
          ${params.totalbayar},
          
          ${accountBank},
          ${params.paymentMethodCode},

          ${params.productName},

          ${params.productPrice},
          ${params.weight},

          ${params.productImage},
          ${params.typeProduct},

          '0',
          '1',
          
          ${tglOrder},
          ${tglOrder},
          
          ${params.userId},
          ${customFieldFirst ? customFieldFirst : 0},
          ${paymentId},
          '0000-00-00 00:00:00',
          '0000-00-00 00:00:00',
          '0000-00-00 00:00:00'
        )
        `

            if (order !== 1) throw new Error('Gagal insert')

            const pesanStr = await tx.t_teks_pesan.findFirst({
                where: {
                    id_user: { equals: params.userId },
                    status_order: { equals: 'order' },
                },
            })

            if (pesanStr) {
                const message = pesanStr.teks_pesan.replaceAll('{{ORDER_ID}}', params.orderId)
                    .replaceAll('{{DETAIL_PRODUK}}', textOrder1)
                    .replaceAll('{{TOTAL_BAYAR}}', formatCurrency(params.totalbayar))
                    .replaceAll('{{METODE_PEMBAYARAN}}', textOrder2)
                    .replaceAll('{{NAMA_TOKO}}', params.namaToko)
                    .replaceAll('{{EKSPEDISI}}', params.expedisi)
                    .replaceAll('{{TANGGAL_ORDER}}', tglOrder)
                    .replaceAll('{{NAMA_PEMBELI}}', params.name)
                    .replaceAll('{{ALAMAT_PEMBELI}}', params.address)
                    .replaceAll('{{WHATSAPP_PEMBELI}}', params.phone)
                textOrder4 = message
            } else {
                const message = `Halo kak, saya baru saja melakukan pemesanan produk di *{{Nama_toko}}* dengan status pembayaran masih *TERTUNDA*\n\nBerikut detail pemesanan saya:\nNomor Invoice: {{Order_id}}\nNama: {{Nama_pembeli}}\nNomor Hp/WA: {{Nomor_pembeli}}\nAlamat: {{Alamat_pembeli}}\n\n{{Text_order}}\n\nSubTotal: *{{Sub_total}}*\n{{Text_order_ongkir}}\nPotongan: *{{Discount}}*\nTotal Bayar: *{{Total_bayar}}*\n\nTerima Kasih *{{Nama_pembeli}}*`
                textOrder4 = message.replaceAll('{{Nama_toko}}', params.namaToko)
                    .replaceAll('{{Order_id}}', params.orderId)
                    .replaceAll('{{Nama_pembeli}}', params.name)
                    .replaceAll('{{Nomor_pembeli}}', params.phone)
                    .replaceAll('{{Alamat_pembeli}}', params.address)
                    .replaceAll('{{Text_order}}', textOrder1)
                    .replaceAll('{{Sub_total}}', formatCurrency(params.total))
                    .replaceAll('{{Text_order_ongkir}}', textOrder2)
                    .replaceAll('{{Discount}}', formatCurrency(params.potongan))
                    .replaceAll('{{Total_bayar}}', formatCurrency(params.totalbayar))
            }

            const notip = await pushNotif(
                textOrder4,
                params.phone,
                params.userId.toString()
            )

            return {
                notip,
                textOrder: textOrder4,
                orderId: params.orderId,
            }
        })

        return {
            textOrder: result.textOrder,
            notip: result.notip,
            orderId: result.orderId,
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        return null
    }
}

export async function createQrisRequest(params: {
    userId: string
    amount: string
    permalink: string
    orderId: string
}) {
    try {
        const headers = new Headers()
        headers.append('Accept', 'application/json')
        headers.append('Content-Type', 'application/json')

        const body = JSON.stringify({
            _key: 'WbsLinkV00',
            userId: params.userId,
            orderId: params.orderId,
            amount: params.amount,
            callback: `${appConfig.domain.storaApi}/${params.permalink}/qris/${params.orderId}`,
        });

        const res = await fetch(
            `${appConfig.domain.storaApi}/apiv2/apixendit/generateQris`,
            {
                headers,
                body,
                method: 'POST',
            }
        )

        if (!res.ok) {
            throw new Error(`status ${res.statusText}`)
        }
        const data = await res.json()

        if (!data?.id) throw new Error('Data tidak ditemukan')

        return data
    } catch (error) {
        throw new Error('Data tidak ditemukan')
    }
}

export async function createVaRequest(params: {
    id_user: string
    totalbayar: string
    bank: string
    order_id: string
}) {
    try {
        const headers = new Headers();
        headers.append('Accept', 'application/json')
        headers.append('Content-Type', 'application/json')

        const res = await fetch(
            `${appConfig.domain.storaApi}/apiv2/apixendit/createVA?_key=WbsLinkV00&idUser=${params.id_user}&amount=${params.totalbayar}&bankCode=${params.bank}&orderId=${params.order_id}`,
            {
                headers,
                method: 'GET',
            }
        )

        if (!res.ok) {
            throw new Error(`status ${res.statusText}`)
        }
        const data = await res.json()

        return data
    } catch (error) {
        throw new Error('Data tidak ditemukan')
    }
}

export async function pushNotif(
    pesan: string,
    no_hp?: string,
    userId?: string
) {
    try {
        if (!no_hp) throw new Error('Nomor toko tidak ditemukan')
        if (!userId) throw new Error('User id tidak ditemukan')
        const myHeaders = new Headers()
        myHeaders.append('Content-Type', 'application/json')

        const raw = JSON.stringify({
            '_key': 'WbslinkV00',
            'idUser': userId,
            'noHp': no_hp,
            'pesan': pesan,
        })

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        }

        const response = await fetch(`${appConfig.domain.storaApi}/apiv3/notifikasi`, requestOptions)
        if (!response.ok) throw new Error('Data tidak ditemukan')
        return 'oke'
    } catch (error) {
        return null
    }
}

export function getOrderId() {
    const date = (new Date).toJSON()
        .slice(0, 10)
        .replace(/\/|-/g, '')
        .toUpperCase()
    const intRandom = Math.random()
        .toString(32)
        .slice(5)
        .toUpperCase()

    return [intRandom, date].filter(Boolean)
        .join('')
}

// get order
export async function findOrderById(prisma: PrismaClient, orderId?: string) {
    if (!orderId) return null
    try {
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.$queryRaw<TOrder[]>`SELECT t_order.order_id,
          t_order.id_produk,
          t_order.nama_produk, 
          t_order.harga_jual, 
          t_order.berat, 
          t_order.gambar_produk, 
          t_order.jenis_produk, 
          t_order.nama_pembeli, 
          t_order.alamat_pembeli, 
          t_order.no_hp_pembeli, 
          t_order.email_pembeli, 
          t_order.prov, 
          t_order.kab, 
          t_order.kec, 
          t_order.qty, 
          t_order.varian, 
          t_order.ukuran, 
          t_order.expedisi, 
          t_order.estimasi, 
          t_order.paket,
          t_order.ongkir,
          t_order.status_bayar,
          t_order.order_status,
          t_order.is_created,
          -- t_order.tgl_order,
          -- t_order.tgl_proses,
          -- t_order.tgl_kirim,
          -- t_order.tgl_selesai,
          t_order.kupon,
          t_order.potongan,
          t_order.total,
          t_order.totalbayar,
          t_order.bank,
          t_order.payment,
          t_order.no_resi,
          t_order.mutasi,
          t_order.id_user,
          t_order.id_custom_field,
          t_order.id_payment
         FROM t_order WHERE order_id = ${orderId} LIMIT 1 OFFSET 0`
            const [firstOrder] = order.filter((_item, index) => index === 0)
            if (!firstOrder) throw new Error('Data tidak ditemukan')
            return firstOrder
        })
        return result
    } catch (error) {
        return null
    }
}

export async function getMultiOrder(prisma: PrismaClient, orderId?: string) {
    if (!orderId) return null
    try {
        const result = await prisma.$transaction(async (tx) => {
            const orders = await tx.$queryRaw<t_multi_order[]>`SELECT t_multi_order.id_order,
            t_multi_order.order_id,
            t_multi_order.kode_keranjang,
            t_multi_order.nama_pembeli,
            t_multi_order.alamat_pembeli,
            t_multi_order.no_hp_pembeli,
            t_multi_order.email_pembeli,
            t_multi_order.prov,
            t_multi_order.kab,
            t_multi_order.kec,
            t_multi_order.expedisi,
            t_multi_order.estimasi,
            t_multi_order.paket,
            t_multi_order.ongkir,
            t_multi_order.status_bayar,
            t_multi_order.order_status,
            t_multi_order.is_created,
            t_multi_order.tgl_order,
            -- t_multi_order.tgl_proses,
            -- t_multi_order.tgl_kirim,
            -- t_multi_order.tgl_selesai,
            t_multi_order.totalbayar,
            t_multi_order.bank,
            t_multi_order.payment,
            t_multi_order.no_resi,
            t_multi_order.mutasi,
            t_multi_order.id_user,
            t_multi_order.id_payment
            FROM t_multi_order
            WHERE t_multi_order.order_id = ${orderId} LIMIT 1 OFFSET 0`
            const [firstOrder] = orders.filter((_item, index) => index === 0)
            if (!firstOrder) throw new Error('Data tidak ditemukan')
            return firstOrder
        })
        return result
    } catch (error) {
        return null
    }
}