"use client"

import { useState } from "react"
import clsx from "clsx"
import { DashboardIcon, ListBulletIcon } from "@radix-ui/react-icons"
import SortingProduct from "./sorting-product"
import { titleToSlug } from "@/utils/to-slug"
import ProductCard from "./product-card"

interface ProductProps {
    products: {
        id_produk: string
        nama_produk: string
        is_free: boolean
        is_free_ongkir: boolean
        id_user: string
        gambar: string
        harga_jual: string
        jenis_produk: string
        views: {
            kd_view_produk: string
            view: string
        } | null
        link: string | null
    }[]
    permalink: string
}

export default function Product({
    products,
    permalink,
}: ProductProps) {
    const [isList, setIsList] = useState(false)

    return (
        <>
            {/* Product */}
            <div className="flex items-center p-6">
                <div>
                    <h3 className="text-sm font-normal tracking-wide">Semua Produk</h3>
                </div>
                <div className="flex-1">
                    <div className="flex justify-end items-center gap-4">
                        <div>
                            <SortingProduct />
                        </div>
                        <div>
                            <button
                                type="button"
                                className="shadow border-0 border-gray-100 bg-white hover:bg-gray-100 rounded-full p-1 sm:p-1.5"
                                onClick={() => {
                                    setIsList((prevState) => !prevState)
                                }}
                            >
                                {isList ? (
                                    <ListBulletIcon className="w-5 h-5" />
                                ) : (
                                    <DashboardIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product list */}
            <ul
                className={clsx(
                    isList ? "grid grid-cols-1" : "grid grid-cols-2",
                    "pb-20 gap-5 px-6"
                )}
            >
                {products.map((item) => {
                    const slug = `/${permalink}/${item.id_produk}/${titleToSlug(item.nama_produk)}`
                    return (
                        <li key={item.id_produk}>
                            <ProductCard
                                product={item}
                                isList={isList}
                                slug={slug}
                            />
                        </li>
                    )
                })}
            </ul>
        </>
    )
}