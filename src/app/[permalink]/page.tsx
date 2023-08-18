import { Suspense } from "react"
import { prisma } from "@/entry-server/config/db"
import { getProductWithPaginate } from "@/entry-server/services/product"
import { getUser } from "@/entry-server/services/user"
import Image from "next/image"
import Link from "next/link"
import { getCategories } from "@/entry-server/services/category"
import Category from "./components/category"
import Product from "./components/product"
// Icons
import ShoppingCartIcon from "../components/shopping-cart-icon"
import whatsAppIcon from "@/app/assets/medsos/WhatsApp.svg"
import facebook from "@/app/assets/medsos/Facebook.svg"
import tiktok from "@/app/assets/medsos/TikTok.svg"
import instagram from "@/app/assets/medsos/Instagram-Logo.wine.svg"
import youtube from "@/app/assets/medsos/YouTube.svg"
import Search from "./components/search"
import ImageProfile from "./components/image-profile"
import LoaderUi from "../components/loader-ui"

interface PermalinkProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

const toProducts = (products: Awaited<ReturnType<typeof getProductWithPaginate>>) => {
    return products.data.map((item) => ({
        id_produk: item.id_produk.toString(),
        nama_produk: item.nama_produk,
        is_free: Boolean(item.is_free === "SATU"),
        is_free_ongkir: Boolean(item.is_free_ongkir === "SATU"),
        id_user: item.id_user.toString(),
        gambar: item.gambar,
        harga_jual: item.harga_jual.toString(),
        jenis_produk: item.jenis_produk,
        views: item.views
            ? {
                kd_view_produk: item.views.kd_view_produk.toString(),
                view: item.views.view.toString(),
            }
            : null,
        link: item.link,
    }))
}

const toCategories = (categories: Awaited<ReturnType<typeof getCategories>>) => {
    return categories.map((item) => ({
        id_kategori_produk: item.id_kategori_produk.toString(),
        kategori: item.kategori,
        count: item._count.products.toString(),
    }))
}

export default async function Permalink({ params, searchParams }: PermalinkProps) {
    const permalink = params.permalink
    const categoryProductId = !Number.isNaN(Number(searchParams?.category?.toString()))
        ? Number(searchParams?.category?.toString())
        : null
    // Service
    const user = await getUser(prisma, permalink)
    const products = await getProductWithPaginate(prisma, {
        permalink,
        page: !Number.isNaN(Number(searchParams?.page))
            ? Number(searchParams.page)
            : 0,
        sort: searchParams?.sort?.toString(),
        search: searchParams?.q?.toString(),
        ...(categoryProductId ? { categoryProductId } : {})
    })
    const categories = await getCategories(prisma, permalink)
    // Map to array
    const productArray = toProducts(products)
    const categoryArray = toCategories(categories)

    if (!user) return <LoaderUi />

    return (
        <>
            {/* Shopping cart icon */}
            <div className="w-full relative">
                <div className="absolute top-10 right-10">
                    <Link href={`/${permalink}/cart`} className="relative">
                        <ShoppingCartIcon className="inline-block h-7 w-7" />
                        <div className="absolute -top-1 -left-3 bg-gray-500 rounded-full text-[9px] w-4 h-4 leading-3 text-gray-100 flex items-center justify-center">
                            99+
                        </div>
                    </Link>
                </div>
            </div>

            {/* Profile pik home */}
            <div className="pt-8 sm:pt-10">
                <div className="flex justify-center">
                    <div>
                        <div className="cursor-pointer">
                            {user.setting ? (
                                <ImageProfile
                                    logo={user.setting.logo_toko}
                                    nama_toko={user.setting.nama_toko}
                                />                                
                            ) : (
                                <div className="animate-pulse">
                                    <div className="inline-block h-[120px] w-[120px] rounded-full shadow-lg"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile store info */}
            <div className="pt-3 sm:pt-3.5">
                <div className="flex justify-center">
                    <div>
                        <div className="group">
                            <div className="cursor-pointer">
                                <h1 className="capitalize text-gray-800 font-medium text-center text-lg sm:text-xl leading-3 tracking-light">
                                    {user.setting?.nama_toko}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alamat */}
                <div className="mt-2 flex justify-center">
                    <div className="w-[239px] sm:w-[300px]">
                        <div>
                            <p className="text-center font-light text-xs text-gray-800 !leading-4">
                                {user.setting?.alamat_toko}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medsos icon list */}
            {user.setting ? (
                <div className="mt-2 flex justify-center space-x-3">
                    {Boolean(user.setting.whatsapp.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Image
                                src={whatsAppIcon}
                                width={100}
                                height={100}
                                alt="WhatsApp"
                            />
                        </div>
                    )}
                    {Boolean(user.setting.instagram.length) && (
                        <div className="relative rounded-full w-8">
                            <Image
                                src={instagram}
                                width={100}
                                height={100}
                                alt="Instgram"
                                className="absolute w-8"
                            />
                        </div>
                    )}
                    {Boolean(user.setting.tiktok.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Image
                                src={tiktok}
                                width={100}
                                height={100}
                                alt="Tiktok"
                            />
                        </div>
                    )}
                    {Boolean(user.setting.facebook.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Image
                                src={facebook}
                                width={100}
                                height={100}
                                alt="Facebook"
                            />
                        </div>
                    )}
                    {Boolean(user.setting.youtube.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Image
                                src={youtube}
                                width={100}
                                height={100}
                                alt="Youtube"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-2 animate-pulse flex justify-center space-x-3">
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                </div>
            )}

            {/* Product filter nav component */}
            <Suspense fallback={<p>Loading...</p>}>
                <Search />
            </Suspense>

            {/* Categories */}
            <Category
                permalink={permalink}
                categories={categoryArray}
                swipe
            />

            {/* Product */}
            <Product
                products={productArray}
                permalink={permalink}
            />
        </>
    )
}