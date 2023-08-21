import { prisma } from "@/entry-server/config/db"
import { getCart } from "@/entry-server/services/carts"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { user_id, cart_id } = req.query

    if (!user_id || !cart_id) {
        return res.json({
            carts: [], free1: [], free2: []
        })
    } 
    const carts = await getCart(prisma, {
        userId: user_id.toString(),
        cartId: cart_id.toString(),
    })
    return res.json({...carts})
}