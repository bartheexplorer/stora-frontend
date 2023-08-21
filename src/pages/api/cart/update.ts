import { prisma } from "@/entry-server/config/db"
import { updateCart } from "@/entry-server/services/carts"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }

    const body = JSON.parse(req.body)

    const result = await updateCart(prisma, body.cartId, body.qty)
    if (!result) {
        return res.status(400)
            .json({ message: "Gagal update data" })
    }

    return res.json({
        body,
        result,
    })
}