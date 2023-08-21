import { prisma } from "@/entry-server/config/db"
import { getCoupon } from "@/entry-server/services/coupon"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { permalink, product_id, coupon } = req.query

    if (!permalink || !product_id || !coupon) {
        return res.status(400)
            .json({ error: "Data tidak ditemukan" }) 
    }

    const result = await getCoupon(prisma, {
        permalink: permalink.toString(),
        productId: product_id.toString(),
        coupon: coupon.toString(),
    })

    if (!result) {
        return res.status(400)
            .json({ error: "Data tidak ditemukan" })
    }

    return res.json({
        data: {
            ...result,
            kupon_terpakai: Number(result.kupon_terpakai),
        },
    })
}
