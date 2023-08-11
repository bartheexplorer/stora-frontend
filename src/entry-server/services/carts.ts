import type { PrismaClient } from "@prisma/client"
import type { CartsEntity, Free1Entity, ParamsCreateCart } from "./carts-interface"

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
        ,if(berat = '0','',CONCAT('Berat : ', berat)) as berat
        ,gambar_produk
        ,jenis_produk
        ,qty
        ,if(varian = '0','',CONCAT('Varian : ', varian)) as varian
        ,if(ukuran = '0','',CONCAT('Ukuran : ', ukuran)) as ukuran
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