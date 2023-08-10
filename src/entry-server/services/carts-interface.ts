import type { t_keranjang } from "@prisma/client"

export type ParamsCreateCart = {
    session: string
    productId: number
    productName: string
    price: number
    weight: number
    productImage: string
    typeProduct: string
    qty: number
    variant: string
    size: string
    coupon: string
    discount: number
    total: number
    userId: number
    freeShipping: boolean
    productFree: boolean
}

export type CartsEntity = {
    id_keranjang: t_keranjang['id_keranjang']
    id_produk: t_keranjang['id_produk']
    nama_produk: t_keranjang['nama_produk']
    berat: string
    gambar_produk: t_keranjang['gambar_produk']
    jenis_produk: t_keranjang['jenis_produk']
    qty: t_keranjang['qty']
    varian: string
    ukuran: string
    kupon: t_keranjang['kupon']
    potongan: t_keranjang['potongan']
    total: t_keranjang['total']
    is_free_ongkir: t_keranjang['is_free_ongkir']
}

export type Free1Entity = {
    kode_keranjang: string
}