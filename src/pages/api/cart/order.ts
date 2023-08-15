import { prisma } from "@/entry-server/config/db"
import { createOrderByCart } from "@/entry-server/services/carts"
import type { CreateOrderByCartParams } from "@/entry-server/services/carts-interface"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }

    const body = JSON.parse(req.body)
    console.log(body)

    let metode_pembayaran: string | undefined = undefined
    if (body.currentPayment?.payment_method === "COD") {
        metode_pembayaran = "cod"
    } else if (body.currentPayment?.payment_method === "QRIS") {
        metode_pembayaran = "qris"
    } else if (body.currentPayment?.payment_method === "va") {
        metode_pembayaran = "virtual"
    } else if (body.currentPayment?.payment_method === "tf") {
        metode_pembayaran = "bank"
    }

    const params: CreateOrderByCartParams = {
        cartId: body.cartId,
        nama: body.nama_lengkap,
        hp: body.nomor_whatsapp, // string
        email: body.email
            ? body.email
            : "", // string
        alamat: body.address?.address
            ? body.address.address
            : "", // string
        provinsi: body.address?.province
            ? body.address.province
            : "", // string
        kota: body.address?.regency
            ? body.address.regency
            : "", // string
        kecamatan: body.address?.sub_district
            ? body.address.sub_district
            : "", // string
        expedisi: body.currentShipping?.s_name
            ? body.currentShipping.s_name
            : "", // string
        paket: body.currentShipping?.service_code
            ? body.currentShipping.service_code
            : "", // string
        ongkir: body.checkout?.ongkir
            ? body.checkout.ongkir // number
            : 0,
        estimasi: body.currentShipping?.etd
            ? body.currentShipping.etd // number
            : 0, // string
        totalbayar: body.checkout?.total
            ? body.checkout.total // number
            : 0, // number
        // bank: string
        // nama_toko: string
        id_user: body.user?.user_id
            ? parseInt(body.user.user_id) // number
            : 0,
        // metode: string
        permalink: body.permalink, // string
        payment_id: body.payment?.id
            ? body.payment.id
            : "0", // string
        account_id: body.payment?.account
            ? body.payment.account
            : "0", // number
        paymentMethodCode: metode_pembayaran, //: string
        no_hp_toko: body.user?.no_hp
            ? body.user.no_hp
            : "",
    }
    const result = await createOrderByCart(prisma, params)
    console.log("result", result)
    if (!result) {
        return res.status(400)
            .json({ message: "Gagal menambahkan data" })
    }

    return res.json({
        ...(result ? result : null),
    })
}