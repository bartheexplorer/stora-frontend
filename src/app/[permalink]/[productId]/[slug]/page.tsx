import { prisma } from "@/entry-server/config/db"
import { getProduct } from "@/entry-server/services/product"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { toIDR } from "@/utils/to-idr"
import Link from "next/link"
import dynamic from "next/dynamic"
import ILoading from "./components/loading"
import { getUser } from "@/entry-server/services/user"
import ContentScrollHeader from "./components/content-scroll-header"

const CountdownTimer = dynamic(() => import("./components/countdown/countdown-time"), {
    ssr: false,
    loading: () => (
        <div className="w-full">
            <div className="animate-pulse">
                <div className="h-[50px] bg-slate-200"></div>
            </div>
        </div>
    )
})

const IFormCheckout = dynamic(() => import("./components/form-checkout/form-checkout"), {
    ssr: false,
    loading: () => (
        <div className="px-8 sm:px-12">
            <h3 className="mb-2">Checkout</h3>
            <ILoading text="Loading..." />
        </div>
    )
})

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
    const user = await getUser(prisma, props.params.permalink)
    const productService = await getProduct(prisma, {
        permalink: props.params.permalink,
        productId: Number(props.params.productId),
    })
    const product = toProduct(productService)

    return (
        <>
            <div className="w-full px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={`/${props.params.permalink}`}
                        className="rounded-full bg-gray-50"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <span className="text-xs font-semibold tracking-wide capitalize">
                            {user?.setting?.permalink
                                ? user.setting.permalink
                                : user?.setting?.nama_toko
                                    ? user.setting.nama_toko
                                    : product?.nama_produk}
                        </span>
                    </div>
                    <div></div>
                </div>
            </div>

            {!!product?.gambar && (
                <ContentScrollHeader
                    images={product.gambar.split(",")}
                    video={product.video}
                    userId={product.id_user.toString()}
                />
            )}

            {!!product?.countText && (
                <CountdownTimer teks_countdown={product.countText.teks_countdown} />
            )}

            {!!product && (
                <div className="relative px-8 mt-4">
                    <h3 className="text-sm font-semibold tracking-wide mb-1.5">
                        {product.nama_produk}
                    </h3>

                    {/* Cek is free */}
                    {!product.is_free ? (
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold tracking-wide">{toIDR(product.harga_jual.toString())}</span>
                            {product.is_free_ongkir && (
                                <div>
                                    <span className="bg-gray-400 text-gray-50 text-[10px] px-1 py-1 rounded-lg">Gratis Ongkir</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold tracking-wide">{toIDR("0")}</span>
                            {product.is_free_ongkir && (
                                <div>
                                    <span className="bg-gray-400 text-gray-50 text-[10px] px-1 py-1 rounded-lg">Gratis Ongkir</span>
                                </div>
                            )}
                        </div>
                    )}

                    {(product.deskripsi.length > 0) ? (
                        <div className="w-full max-h-[200] mt-2 mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xs text-gray-700 font-semibold tracking-wide">Deskripsi</h3>
                                <div>
                                    {!!product.views && (
                                        <div className="text-xs font-semibold tracking-wide text-gray-700">Dilihat {product.views.count} kali</div>
                                    )}
                                </div>
                            </div>
                            <p className="text-wrap text-xs text-gray-700 text-left leading-4">{product.deskripsi}</p>
                        </div>
                    ) : (
                        <div className="w-full max-h-[200] mt-3">
                            <div className="flex justify-between mb-2 items-center">
                                <h3 className="text-xs text-gray-700 font-semibold tracking-wide">&nbsp;</h3>
                                <div>
                                    {!!product.views && (
                                        <div className="text-xs font-semibold tracking-wide text-gray-700">Dilihat {product.views.count} kali</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {(Array.isArray(product.benefits) && product.benefits.length > 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-3">
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
                    user={{
                        name: user?.nama_lengkap,
                        no_hp: user?.setting?.no_hp_toko,
                        user_id: user?.id_user.toString(),
                        member_id: user?.user_id.toString(),
                    }}
                    permalink={props.params.permalink}
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
                        productImg: product.gambar.split(",")[0],
                        productName: product.nama_produk,
                        price: Number(product.harga_jual),
                        isFree: product.is_free,
                        isFreeOngkir: product.is_free_ongkir,
                        userId: product.id_user.toString(),
                        weight: product.berat.toString(),
                        typeProduct: product.jenis_produk,
                        productId: product.id_produk.toString(),
                        textBtnOrder: product.text_button_order.length > 0 ? product.text_button_order.toString() : "Selesaikan Pesanan",
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
                    payment={{
                        transfer: user?.banks ? user.banks.map((item) => ({
                            id_bank: item.id_bank.toString(), // 21,
                            bank: item.bank, // "BANK CENTRAL ASIA",
                            rekening: item.rekening, // "799199191",
                            pemilik: item.pemilik, // "Klikdigital Indonesia",
                            is_active: Boolean(item.is_active === "SATU"), // "SATU",
                        })) : [],
                        va: user?.xendits_va ? user.xendits_va.map((item) => ({
                            id_bank_va_xendit: item.id_bank_va_xendit.toString(), // 35,
                            bank_code: item.bank_code, // "BCA",
                            is_active: Boolean(item.is_active === "SATU"), // "SATU"
                        })) : [],
                        settings: user?.xendits ? user.xendits.map((item) => ({
                            id_setting_xendit: item.id_setting_xendit.toString(), // 19,
                            business_name: item.business_name, // "admin",
                            country: item.country, // "ID",
                            is_active: Boolean(item.is_active === "SATU"), // "SATU",
                            is_blocked: Boolean(item.is_blocked === "SATU"), // "NOL",
                            status_qris: Boolean(item.status_qris === "SATU"), // "SATU",
                            status_va: Boolean(item.status_va === "SATU"), // "SATU",
                            fee: item.fee, // "seller"
                        })) : [],
                    }}
                    codeUnique={Boolean(user?.setting?.status_kode_unik === "SATU")}
                />
            )}

            {props.searchParams?.is_dev && (
                <>
                    <pre className="block">
                        {JSON.stringify(product, undefined, 2)}
                    </pre>

                    <pre className="block">
                        {JSON.stringify(user, undefined, 2)}
                    </pre>
                </>
            )}
        </>
    )
}