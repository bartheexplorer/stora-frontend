import { prisma } from "@/entry-server/config/db"
import { destroyCart, updateCart } from "@/entry-server/services/carts"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }

    const { cart_id } = req.query

    if (!cart_id || typeof cart_id !== "string") {
        return res.status(400)
            .json({ message: "Gagal hapus data" })
    }

    const result = await destroyCart(prisma, parseInt(cart_id))
    if (!result) {
        return res.status(400)
            .json({ message: "Gagal hapus data" })
    }

    return res.json({
        result,
    })
}