import { prisma } from "@/entry-server/config/db"
import { getProduct } from "@/entry-server/services/product"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import ContentHeader from "./components/content-header"
import CountdownTimer from "./components/countdown/countdown-time"
import { toIDR } from "@/utils/to-idr"
import IFormCheckout from "./components/form-checkout/form-checkout"
import Link from "next/link"

interface SlugProps {
    params: {
        permalink: string
        productId: string
        slug: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

const toProduct = (product: Awaited<ReturnType<typeof getProduct>>) => {
    if (!product) return null
    return {
        ...product,
        countText: product.countText,
        id_produk: product.id_produk,
        id_user: product.id_user,
        id_kategori_produk: product.id_kategori_produk,
        nama_produk: product.nama_produk,
        jenis_produk: product.jenis_produk,
        harga_jual: product.harga_jual.toString(),
        berat: product.berat.toString(),
        gambar: product.gambar,
        video: product.video,
        link: product.link,
        deskripsi: product.deskripsi,
        is_active: Boolean(product.is_active === "SATU"),
        is_free_ongkir: Boolean(product.is_free_ongkir === "SATU"),
        is_free: Boolean(product.is_free === "SATU"),
        status: Boolean(product.status === "aktif"),
        text_button_order: product.text_button_order,
        created: product.created,
        sts_kupon: product.sts_kupon.toString(),
        category: product.category
            ? {
                ...product.category,
                id_kategori_produk: product.category.id_kategori_produk.toString(),
                kategori: product.category.kategori,
            } : null,
        views: product.views
            ? {
                ...product.views,
                count: product.views.view,
            } : null,
        variantions: product.variantions.map((item) => ({
            ...item,
            id_produk_varian: item.id_produk_varian.toString(),
            varian: item.varian?.toString(),
        })),
        sizes: product.sizes.map((item) => ({
            ...item,
            id_produk_ukuran: item.id_produk_ukuran.toString(),
            ukuran: item.ukuran,
            harga_uk: item.harga_uk.toString(),
        }))
    }
}

export default async function Slug(props: SlugProps) {
    const productService = await getProduct(prisma, {
        permalink: props.params.permalink,
        productId: Number(props.params.productId),
    })
    const product = toProduct(productService)

    return (
        <>
            <div className="absolute z-10 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={`/${props.params.permalink}`}
                        className="rounded-full bg-gray-50"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <div className="flex-1"></div>
                    <div></div>
                </div>
            </div>

            {!!product?.gambar && (
                <ContentHeader
                    images={product.gambar.split(",")}
                    video={product.video}
                    userId={product.id_user.toString()}
                />
            )}

            {!!product?.countText && (
                <div className="w-full max-w-full mx-auto z-20">
                    <div className="bg-green-500 text-center py-1">
                        <h3 className="text-white uppercase text-[10px] font-medium">{product.countText.teks_countdown}</h3>
                        <div className="mt-0 text-white text-base font-medium">
                            <CountdownTimer />
                        </div>
                    </div>
                </div>
            )}

            {!!product && (
                <div className="relative p-8">
                    <h3 className="text-sm font-semibold tracking-wide mb-2">
                        {product.nama_produk}
                    </h3>

                    {/* Cek is free */}
                    {!product.is_free && (
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold ">{toIDR(product.harga_jual.toString())}</span>
                            {product.is_free_ongkir && (
                                <div>
                                    <span className="bg-gray-400 text-gray-50 text-[10px] px-1 py-1 rounded-lg">Gratis Ongkir</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Is Free ongkir */}
                    <div className="flex justify-end items-center">
                        {!!product.views && (
                            <div className="text-xs">Dilihat {product.views.count} kali</div>
                        )}
                    </div>

                    {(product.deskripsi.length > 0) && (
                        <div className="w-full max-h-[200] mt-3">
                            <h3 className="text-xs text-gray-700 font-semibold tracking-wide mb-2">Deskripsi</h3>
                            <p className="text-wrap text-xs text-gray-700 text-left leading-6">{product.deskripsi}</p>
                        </div>
                    )}

                    {(Array.isArray(product.benefits) && product.benefits.length > 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-xs mb-2">Benefit:</h4>
                            <ul className="list-disc list-inside">
                                {product.benefits.map((item) => {
                                    return (
                                        <li key={item.id_benefit} className="text-xs">{item.benefit}</li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {!!product && (
                <IFormCheckout
                    variations={product.variantions.map((item) => ({
                        id: item.id_produk_varian.toString(),
                        name: item.varian ? item.varian : "",
                    }))}
                    sizes={product.sizes.map((item) => ({
                        id: item.id_produk_ukuran.toString(),
                        name: item.ukuran,
                        price: item.harga_uk,
                    }))}
                    product={{
                        typeProduct: product.jenis_produk,
                        productId: product.id_produk.toString(),
                        customFields: product.customFields.map((item) => ({
                            id: item.id_custom_field.toString(),
                            idx: item.idx,
                            label: item.label,
                            field: item.field,
                            is_option: Boolean(item.is_option === "SATU"),
                            options: item.options.map((item) => ({
                                id: item.id_option.toString(),
                                value: item.value,
                            })),
                            placeholder: item.placeholder,
                            required: Boolean(item.required === "yes"),
                            type: item.type ? item.type : "text",
                        }))
                    }}
                />
            )}

            <pre>
                {JSON.stringify(product, undefined, 2)}
            </pre>
        </>
    )
}