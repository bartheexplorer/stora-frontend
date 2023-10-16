import { prisma } from "@/entry-server/config/db"
import { getProductWithPaginate } from "@/entry-server/services/product"
import { getUser } from "@/entry-server/services/user"
import Image from "next/image"
import Link from "next/link"
import { getCategories } from "@/entry-server/services/category"
// Icons
import ShoppingCartIcon from "../components/shopping-cart-icon"
import whatsAppIcon from "@/app/assets/medsos/WhatsApp.svg"
import facebook from "@/app/assets/medsos/Facebook.svg"
import tiktok from "@/app/assets/medsos/TikTok.svg"
import instagram from "@/app/assets/medsos/Instagram-Logo.wine.svg"
import youtube from "@/app/assets/medsos/YouTube.svg"
import ImageProfile from "./components/image-profile"
import LoaderUi from "../components/loader-ui"
import dynamic from "next/dynamic"
import { cookies } from "next/headers"
import type { Metadata, ResolvingMetadata } from "next"

const DynamicCartCounter = dynamic(() => import("./components/cart/cart-counter"), {
    ssr: false,
    loading: () => <p className="sr-only">Loading...</p>
})

const DynamicSearch = dynamic(() => import("./components/search"), {
    ssr: false,
    loading: () => (
        <div className="px-20 animate-pulse my-6">
            <div className="h-12 rounded-full bg-slate-200 w-full max-w-full"></div>
        </div>
    )
})

const DynamicProductContent = dynamic(() => import("./components/product"), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse px-8 mb-8">
            <div className="flex justify-between mb-1">
                <div>
                    <div className="h-8 w-[120px] bg-slate-200 rounded mb-3"></div>
                </div>
                <div>
                    <div className="h-10 w-[170px] bg-slate-200 rounded mb-3"></div>
                </div>

            </div>
            <div className="flex gap-6 mb-6">
                <div className="h-[220px] rounded-2xl bg-slate-200 w-full"></div>
                <div className="h-[220px] rounded-2xl bg-slate-200 w-full"></div>
            </div>
            <div className="flex gap-6 mb-6">
                <div className="h-[220px] rounded-2xl bg-slate-200 w-full"></div>
                <div className="h-[220px] rounded-2xl bg-white w-full"></div>
            </div>
        </div>
    )
})

const DynamicCategory = dynamic(() => import("./components/category"), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse px-8 mb-8">
            <div className="h-6 w-[200px] bg-slate-200 rounded mb-3"></div>
            <div className="flex gap-4">
                <div className="h-14 rounded-lg bg-slate-200 w-full"></div>
                <div className="h-14 rounded-lg bg-slate-200 w-full"></div>
                <div className="h-14 rounded-lg bg-slate-200 w-full"></div>
            </div>
        </div>
    )
})

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

function _slugToTitle(slug: string): string {
    const words = slug.split('-'); // Split the slug into words using dashes
    const titleWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize each word

    return titleWords.join(' '); // Join the words back together with spaces
}

export async function generateMetadata(
    { params, searchParams }: PermalinkProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    console.log(params, searchParams)
    const permalink = `${params.permalink} | Stora`
    // const _permak_link = _slugToTitle(permalink)
    // const user = await getUser(prisma, _permak_link)
    const description = (await parent).description || ""

    return {
        title: permalink,
        description,
    }
}

export default async function Permalink({ params, searchParams }: PermalinkProps) {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartid")
    const permalink = params.permalink
    const _permak_link = _slugToTitle(permalink)

    const categoryProductId = !Number.isNaN(Number(searchParams?.category?.toString()))
        ? Number(searchParams?.category?.toString())
        : null
    // Service
    const user = await getUser(prisma, _permak_link)
    const _query = searchParams?.sort?.toString()
    const products = await getProductWithPaginate(prisma, {
        permalink: _permak_link,
        page: !Number.isNaN(Number(searchParams?.page))
            ? Number(searchParams.page)
            : 0,
        sort: _query || "terbaru",
        search: searchParams?.q?.toString(),
        ...(categoryProductId ? { categoryProductId } : {})
    })
    const categories = await getCategories(prisma, _permak_link)
    // Map to array
    const productArray = toProducts(products)
    const categoryArray = toCategories(categories)

    if (!user) return <LoaderUi />

    const _userId = user.id_user
        ? user.id_user.toString()
        : ""

    // console.log("productArray", productArray)

    return (
        <div className="w-full min-h-screen">
            {/* Shopping cart icon */}
            <div className="w-full relative">
                <div className="absolute top-10 right-10">
                    <Link href={`/${permalink}/cart`} className="relative">
                        <ShoppingCartIcon className="inline-block h-7 w-7" />
                        <DynamicCartCounter
                            userId={_userId}
                            cartId={cartId?.value.toString()}
                        />
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
                <div className="py-2 flex justify-center space-x-4">
                    {Boolean(user.setting.whatsapp.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Link target="_blank" href={`https://wa.me/+${user.setting.whatsapp.toString()}?text=Halo+Admin`}>
                                <Image
                                    src={whatsAppIcon}
                                    width={100}
                                    height={100}
                                    alt="WhatsApp"
                                />
                            </Link>
                        </div>
                    )}
                    {Boolean(user.setting.instagram.length) && (
                        <div className="relative rounded-full w-8">
                            <Link target="_blank" href={`https://instagram.com/${user.setting.instagram.toString()}`}>
                                <Image
                                    src={instagram}
                                    width={100}
                                    height={100}
                                    alt="Instgram"
                                    className="absolute w-8"
                                />
                            </Link>
                        </div>
                    )}
                    {Boolean(user.setting.tiktok.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Link target="_blank" href={`https://tiktok.com/${user.setting.tiktok.toString()}`}>
                                <Image
                                    src={tiktok}
                                    width={100}
                                    height={100}
                                    alt="Tiktok"
                                />
                            </Link>
                        </div>
                    )}
                    {Boolean(user.setting.facebook.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Link target="_blank" href={`https://facebook.com/${user.setting.facebook.toString()}`}>
                                <Image
                                    src={facebook}
                                    width={100}
                                    height={100}
                                    alt="Facebook"
                                />
                            </Link>
                        </div>
                    )}
                    {Boolean(user.setting.youtube.length) && (
                        <div className="rounded-full h-5 w-5">
                            <Link target="_blank" href={`https://youtube.com/${user.setting.youtube.toString()}`}>
                                <Image
                                    src={youtube}
                                    width={100}
                                    height={100}
                                    alt="Youtube"
                                />
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-2 animate-pulse flex justify-center space-x-3">
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                    <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                </div>
            )}

            {/* Product filter nav component */}
            <DynamicSearch />

            {/* Categories */}
            <DynamicCategory
                permalink={permalink}
                categories={categoryArray}
                swipe
            />

            {/* Product */}
            <DynamicProductContent
                products={productArray}
                permalink={permalink}
            />
        </div>
    )
}