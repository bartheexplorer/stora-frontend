import { prisma } from "@/entry-server/config/db"
import { createCarts } from "@/entry-server/services/carts"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }

    const body = JSON.parse(req.body)
    console.log(body)

    const params = {
        session: body.cartId
            ? body.cartId as string
            : "", // string
        productId: !Number.isNaN(parseInt(body.product.productId))
            ? Number(body.product.productId)
            : 0, // number
        productName: body.product.productName
            ? body.product.productName as string
            : "", // string
        price: !Number.isNaN(parseInt(body.checkout.afterPrice))
            ? Number(body.checkout.afterPrice)
            : 0, // number
        weight: !Number.isNaN(parseInt(body.product.weight)) ? Number(body.product.weight) : 0, // number
        productImage: body.product.productImg
            ? body.product.productImg as string
            : "", // string
        typeProduct: body.product.typeProduct
            ? body.product.typeProduct as string
            : "", // string
        qty: !Number.isNaN(parseInt(body.qty))
            ? Number(body.qty)
            : 0, // number
        variant: body.variation
            ? body.variation as string
            : "", // string
        size: body.size
            ? body.size as string
            : "", // string
        coupon: body.couponData
            ? body.couponData.coupon as string
            : "", // string
        discount: body.couponData
            ? !Number.isNaN(parseInt(body.couponData.discount))
                ? Number(body.couponData.discount)
                : 0
            : 0, // number
        total: !Number.isNaN(parseInt(body.checkout.subTotal))
            ? Number(body.checkout.subTotal)
            : 0, // number
        userId: !Number.isNaN(parseInt(body.product.userId))
            ? Number(body.product.userId)
            : 0, // number
        freeShipping: Boolean(body.product.isFreeOngkir), // boolean
        productFree: Boolean(body.product.isFree), // boolean
    }

    const result = await createCarts(prisma, params)
    if (!result) {
        return res.status(400)
            .json({ message: "Gagal inset data" })
    }

    return res.json({
        data: {...result},
        // params,
        // body,
    })
}
