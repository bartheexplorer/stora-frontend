import { prisma } from "@/entry-server/config/db"
import { getCustomFieldById } from "@/entry-server/services/custom-field"
import { createOrder, getOrderId } from "@/entry-server/services/order"
import type { OrderCustomField, OrderParams } from "@/entry-server/services/order-interface"
import type { NextApiRequest, NextApiResponse } from "next"

const ORDER_ID = getOrderId()

// {
//     "data": "post",
//     "body": {
//         "nama_lengkap": "Siti Nourbaya",
//         "nomor_whatsapp": "082187617384",
//         "jumlah": "1",
//         "custom_fields": [
//             {
//                 "label": "Kode Pos",
//                 "value": "96128",
//                 "field": "input",
//                 "required": true,
//                 "placeholder": "Kode Pos",
//                 "options": []
//             },
//             {
//                 "label": "Catatan",
//                 "value": "Jl Pangeran HIdayat",
//                 "field": "textarea",
//                 "required": false,
//                 "placeholder": "Catatan",
//                 "options": []
//             }
//         ],
//         "variasi": "Kemeja LD ",
//         "ukuran": "29 cm",
//         "payment": {
//             "id": "21",
//             "bank": "BANK CENTRAL ASIA",
//             "account": "799199191",
//             "name": "Klikdigital Indonesia",
//             "payment_method": "tf"
//         },
//         "checkout": {
//             "total": 509082,
//             "subTotal": 208990,
//             "price": 208000,
//             "afterPrice": 208990,
//             "qty": 1,
//             "randCode": 92,
//             "ongkir": 300000
//         },
//         "address": {
//             "province": "GORONTALO",
//             "regency": "KOTA GORONTALO",
//             "sub_district": "KOTA TENGAH",
//             "urban_village": "DULALOWO TIMUR",
//             "address": "Jl Pangeran hidayat",
//             "id_mapping": "70957",
//             "zip_code": "96128",
//             "shipping": {
//                 "service_code": "JTR<150",
//                 "service_name": "JTR<150",
//                 "price": 300000,
//                 "etd": "3 - 4 hari",
//                 "discount_price": 300000,
//                 "cashless_discount_price": 300000,
//                 "s_name": "jne"
//             }
//         },
//         "currentPayment": {
//             "id": "21",
//             "bank": "BANK CENTRAL ASIA",
//             "account": "799199191",
//             "name": "Klikdigital Indonesia",
//             "payment_method": "tf"
//         },
//         "couponData": null,
//         "permalink": "admin",
//         "user": {
//             "name": "Admin WBSLINK",
//             "no_hp": "081354312763",
//             "user_id": 16,
//             "member_id": 29441
//         },
//         "is_free": false,
//         "is_free_ongkir": false,
//         "weight": "3000",
//         "nama_produk": "1 set Baju Bayi Laki Laki  Vest",
//         "product_id": "1294",
//         "type_product": "fisik"
//     }
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }
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

    let metode_pembayaran: OrderParams["paymentMethodCode"] = "bank"
    if (body.payment.payment_method === "COD") {
        metode_pembayaran = "cod"
    } else if (body.payment.payment_method === "QRIS") {
        metode_pembayaran = "qris"
    } else if (body.payment.payment_method === "va") {
        metode_pembayaran = "virtual"
    } else if (body.payment.payment_method === "tf") {
        metode_pembayaran = "bank"
    }
    
    const params: OrderParams = {
        userId: !Number.isNaN(parseInt(body.user?.user_id)) ? Number(body.user.user_id) : 0, // t_user['id_user']
        productId: !Number.isNaN(parseInt(body.product_id)) ? Number(body.product_id) : 0, // t_produk['id_produk']
        orderId: ORDER_ID, // t_order['order_id']
        customFields: custom, // CustomField[]
        paymentMethodCode: metode_pembayaran, // string | null
        isFree: body.is_free, // boolean
        paymentMethodId: !Number.isNaN(parseInt(body.payment?.id)) ? Number(body.payment.id) : 0, // number
        name: body.nama_lengkap, // string
        phone: body.nomor_whatsapp ? body.nomor_whatsapp.toString() : "", // string
        email: body.email ? body.email : "" , // string
        // Address
        address: body.address?.address ? body.address.address : "", // string
        province: body.address?.province ? body.address.province : "", // string
        city: body.address?.regency ? body.address.regency : "", // string
        subdistrict: body.address?.sub_district ? body.address.sub_district : "", // string
        qty: !Number.isNaN(parseInt(body.jumlah)) ? Number(body.jumlah) : 0, // number
        // variant
        variant: body.variasi ? body.variasi : null, // string | null
        size: body.ukuran ? body.ukuran : null, // string | null
        // expedisi
        expedisi: body.address?.shipping?.s_name ? body.address?.shipping?.s_name : "", // string
        paket: body.address?.shipping?.service_code ? body.address?.shipping?.service_code : "", // string
        ongkir: !Number.isNaN(parseInt(body.address?.shipping?.price)) ? Number(body.address?.shipping?.price) : 0, // number
        estimasi: body.address?.shipping?.etd, // string
        kupon: body.couponData ? body.couponData.coupon : null, // string | null
        // Total
        potongan: !Number.isNaN(parseInt(body.couponData?.discount)) ? Number(body.couponData.discount) : 0, // number
        total: !Number.isNaN(parseInt(body.checkout?.total)) ? Number(body.checkout.total) : 0, // number
        totalbayar: !Number.isNaN(parseInt(body.checkout?.total)) ? Number(body.checkout.total) : 0, // number

        // Product
        productName: body.nama_produk, // string
        productPrice: !Number.isNaN(parseInt(body.checkout?.afterPrice)) ? Number(body.checkout.afterPrice) : 0, // number
        productImage: body.product_img ? body.product_img : "", // string
        typeProduct: body.type_product ? body.type_product : "", // string
        // produk
        weight: !Number.isNaN(parseInt(body.weight)) ? Number(body.weight) : 0, // number
        permalink: body.permalink ? body.permalink : "", // string
        // Nama toko
        namaToko:  body.user?.name ? body.user.name : "", //string
        phoneToko: body.user?.no_hp ? body.user.no_hp : "", // string
    }

    const result = await createOrder(prisma, params)

    return res.json({
        data: "post",
        body,
        params,
        result,
    })
}
