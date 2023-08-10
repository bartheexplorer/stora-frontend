import { prisma } from "@/entry-server/config/db"
import { createOrder, getOrderId } from "@/entry-server/services/order"
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
    const body = req.body
    
    
    const params = {
        userId: body.user?.id_user, // t_user['id_user']
        productId: body.product_id, // t_produk['id_produk']
        orderId: ORDER_ID, // t_order['order_id']
        customFields: [], // CustomField[]
        paymentMethodCode: "bank", // string | null
        isFree: body.is_free, // boolean
        paymentMethodId: body.payment?.id, // number
        name: body.nama_lengkap, // string
        phone: body.nomor_whatsapp, // string
        email: body.email ? body.email : "" , // string
        // Address
        address: body.address?.address, // string
        province: body.address?.province, // string
        city: body.address?.regency, // string
        subdistrict: body.address?.sub_district, // string
        qty: body.jumlah, // number
        // variant
        variant: body.variasi, // string | null
        size: body.ukuran, // string | null
        // expedisi
        expedisi: body.address?.shipping?.s_name, // string
        paket: body.address?.shipping?.service_code, // string
        ongkir: body.address?.shipping?.price, // number
        estimasi: body.address?.shipping?.etd, // string
        kupon: body.couponData ? body.couponData.coupon : null, // string | null
        // Total
        potongan: body.couponData ? body.couponData.discount : 0, // number
        total: body.checkout?.total, // number
        totalbayar: body.checkout?.total, // number

        // Product
        productName: body.nama_produk, // string
        productPrice: body.checkout?.afterPrice, // number
        productImage: body.product_img ? body.product_img : "", // string
        typeProduct: body.type_product, // string

        weight: body.weight, // number
        permalink: body.permalink, // string

        // Nama toko
        namaToko:  body.user?.name, //string
        phoneToko: body.user?.no_hp, // string
    }

    // createOrder(prisma, {
    //     userId: 0, // t_user['id_user']
    //     productId: 0, // t_produk['id_produk']
    //     orderId: "0", // t_order['order_id']
    //     customFields: [], // CustomField[]
    //     paymentMethodCode: "", // string | null
    //     isFree: false, // boolean
    //     paymentMethodId: 0, // number
    //     name: "", // string
    //     phone: "", // string
    //     email: "", // string
    //     // Address
    //     address: "", // string
    //     province: "", // string
    //     city: "", // string
    //     subdistrict: "", // string
    //     qty: 0, // number
    //     // variant
    //     variant: "", // string | null
    //     size: "", // string | null
    //     // expedisi
    //     expedisi: "", // string
    //     paket: "", // string
    //     ongkir: 0, // number
    //     estimasi: "", // string
    //     kupon: "", // string | null
    //     // Total
    //     potongan: 0, // number
    //     total: 0, // number
    //     totalbayar: 0, // number

    //     // Product
    //     productName: "", // string
    //     productPrice: 0, // number
    //     productImage: "", // string
    //     typeProduct: "", // string

    //     weight: 0, // number
    //     permalink: "", // string

    //     // Nama toko
    //     namaToko:  "", //string
    //     phoneToko: "", // string
    // })

    return res.json({
        data: "post",
        body: JSON.parse(body),
        params,
    })
}
