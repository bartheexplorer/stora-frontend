import type {
    t_kategori_produk,
    t_produk,
    t_view_produk,
    t_produk_varian,
    t_produk_ukuran,
    t_produk_benefit,
    t_setting,
    t_user,
    t_custom_field,
    t_option,
    t_countdown,
} from '@prisma/client'

export type Product = t_produk & {
    user: User
    category: t_kategori_produk | null
    views: t_view_produk | null
    variants: t_produk_varian[]
    sizes: t_produk_ukuran[]
    benefits: t_produk_benefit[]
}

type User = t_user & {
    setting: {
        nama_toko: t_setting['nama_toko']
        permalink: t_setting['permalink']
    } | null
}

export type CustomField = {
    id_custom_field: t_custom_field['id_custom_field']
    field: t_custom_field['field']
    type: t_custom_field['type']
    required: t_custom_field['required']
    label: t_custom_field['label']
    placeholder: t_custom_field['placeholder']
    is_option: t_custom_field['is_option']
    idx: t_custom_field['idx']
}

export type Options = {
    id_option: t_option['id_option']
    value: t_option['value']
}

export type ProductDetail = Product & {
    customFields: (CustomField & {
        options: Options[]
    })[]
    countText: TCountdown | null
}

export type TCountdown = t_countdown