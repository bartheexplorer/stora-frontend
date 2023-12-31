import { prisma } from "@/entry-server/config/db"
import { createOrder, getOrderId } from "@/entry-server/services/order"
import type { OrderCustomField, OrderParams } from "@/entry-server/services/order-interface"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }
    const ORDER_ID = getOrderId()
    const body = JSON.parse(req.body)

    const custom: OrderCustomField[] = []

    if (Array.isArray(body.custom_fields) && body.custom_fields.length) {
        for (const item of body.custom_fields) {
            custom.push({
                idCustomField: !Number.isNaN(parseInt(item.id)) ? Number(item.id) : 0,
                value: item.value,
                label: item.label,
              })
          }
    }

    let metode_pembayaran: OrderParams["paymentMethodCode"] = null
    if (body.currentPayment?.payment_method === "COD") {
        metode_pembayaran = "cod"
    } else if (body.currentPayment?.payment_method === "QRIS") {
        metode_pembayaran = "qris"
    } else if (body.currentPayment?.payment_method === "va") {
        metode_pembayaran = "virtual"
    } else if (body.currentPayment?.payment_method === "tf") {
        metode_pembayaran = "bank"
    }

    const subDistrict_str = body.address?.sub_district && body.address?.id_mapping
        ?  [body.address.id_mapping, body.address.sub_district].join("=")
        : ""
    
    const params: OrderParams = {
        userId: !Number.isNaN(parseInt(body.user?.user_id)) ? Number(body.user.user_id) : 0,
        productId: !Number.isNaN(parseInt(body.product_id)) ? Number(body.product_id) : 0,
        orderId: ORDER_ID,
        customFields: custom,
        paymentMethodCode: metode_pembayaran,
        isFree: Boolean(body.is_free),
        isFreeOngkir: Boolean(body.is_free_ongkir),
        paymentMethodId: !Number.isNaN(parseInt(body.currentPayment?.id))
            ? Number(body.currentPayment.id)
            : 0,
        name: body.nama_lengkap ? body.nama_lengkap: "",
        phone: body.nomor_whatsapp ? body.nomor_whatsapp.toString() : "",
        email: body.email ? body.email : "" ,
        // Address
        address: body.address?.address ? body.address.address : "",
        province: body.address?.province ? body.address.province : "",
        city: body.address?.regency ? body.address.regency : "",
        subdistrict: subDistrict_str,
        qty: !Number.isNaN(parseInt(body.jumlah)) ? Number(body.jumlah) : 0,
        // variant
        variant: body.variasi ? body.variasi : null,
        size: body.ukuran ? body.ukuran : null,
        // expedisi
        expedisi: body.currentShipping?.s_name ? body.currentShipping.s_name : "",
        paket: body.currentShipping?.service_code ? body.currentShipping.service_code : "",
        ongkir: body.currentShipping?.price
            ? !Number.isNaN(parseInt(body.currentShipping.price))
                ? Number(body.currentShipping.price)
                : 0
            : 0,
        estimasi: body.currentShipping?.etd
            ? body.currentShipping.etd
            : "",
        kupon: body.couponData
            ? body.couponData.coupon
            : null,
        // Total
        potongan: !Number.isNaN(parseInt(body.couponData?.discount))
            ? Number(body.couponData.discount)
            : 0,
        total: !Number.isNaN(parseInt(body.checkout?.total))
            ? Number(body.checkout.total)
            : 0,
        totalbayar: !Number.isNaN(parseInt(body.checkout?.total))
            ? Number(body.checkout.total)
            : 0,
        // Product
        productName: body.nama_produk ? body.nama_produk : "",
        productPrice: !Number.isNaN(parseInt(body.checkout?.afterPrice))
            ? Number(body.checkout.afterPrice)
            : 0,
        productImage: body.product_img ? body.product_img : "",
        typeProduct: body.type_product ? body.type_product : "",
        // produk
        weight: !Number.isNaN(parseInt(body.weight)) ? Number(body.weight) : 0,
        permalink: body.permalink ? body.permalink : "",
        // Nama toko
        namaToko:  body.user?.name ? body.user.name : "",
        phoneToko: body.user?.no_hp ? body.user.no_hp : "",
    }

    const result = await createOrder(prisma, params)
    if (!result) {
        return res.status(400)
            .json({
                message: "Gagal menyimpan"
            })
    }

    return res.json({
        // body,
        // params,
        data: {...result},
    })
}
