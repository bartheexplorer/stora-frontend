import type { t_user, t_produk, t_order } from "@prisma/client"

export type OrderCustomField = {
    idCustomField: number
    value: string
    label: string
}

export type OrderParams = {
    userId: t_user['id_user']
    productId: t_produk['id_produk']
    orderId: t_order['order_id']
    customFields: OrderCustomField[]
    paymentMethodCode: "bank" | "virtual" | "qris" | "cod"
    isFree: boolean
    paymentMethodId: number
    name: string
    phone: string
    email: string
    // Address
    address: string
    province: string
    city: string
    subdistrict: string
    qty: number
    // variant
    variant: string | null
    size: string | null
    // expedisi
    expedisi: string
    paket: string
    ongkir: number
    estimasi: string
    kupon: string | null
    // Total
    potongan: number
    total: number
    totalbayar: number

    // Product
    productName: string
    productPrice: number
    productImage: string
    typeProduct: string

    weight: number
    permalink: string

    // Nama toko
    namaToko: string
    phoneToko?: string
}