import type { PrismaClient } from "@prisma/client"
import type { TCouponResult } from "./coupon-interface"

export async function getCoupon(prisma: PrismaClient, params: {
    permalink?: string
    productId?: string
    coupon?: string
}) {
    try {
        const productIdStr = `%${params.productId}%`
        const result = await prisma.$queryRaw<TCouponResult[]>`SELECT
        t_kupon.id_kupon,
        t_kupon.kupon,
        t_kupon.diskon,
        t_kupon.tipe,
        t_kupon.jumlah_batas,
        t_kupon.is_active,
        COUNT(t_order.kupon) AS kupon_terpakai,
        IF(COUNT(t_order.kupon) >= t_kupon.jumlah_batas, 1, 0) as x 
        FROM t_kupon
        LEFT JOIN t_order ON (t_order.kupon = t_kupon.kupon)
        WHERE
          (
            (t_kupon.id_user) IN (
              SELECT t0.id_user FROM t_user AS t0
              INNER JOIN t_setting AS j0 ON (j0.id_user = t0.id_user)
              WHERE (j0.nama_toko = ${params.permalink} OR j0.permalink = ${params.permalink})
            )
          )
        AND UPPER(t_kupon.kupon) = UPPER(${params.coupon})
        -- AND k.id_produk='$id_produk'
        AND t_kupon.id_produk LIKE ${productIdStr}
        AND t_kupon.is_active = "1"
        GROUP BY t_order.kupon
        LIMIT 1 OFFSET 0
        `
        const [item] = result.filter((_item, i) => i === 0)
        return item ? item : null
    } catch (error) {
        return null
    }
}