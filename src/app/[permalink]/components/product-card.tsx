import Image from "next/image"
import Link from "next/link"
import ShoppingCartIcon from "@/app/components/shopping-cart-icon"
import clsx from "clsx"
import { toIDR } from "@/utils/to-idr"
import { usePhotoProduct } from "@/hooks/product"
import { shimmer, toBase64 } from "@/utils/shimmer"
import { blurImage } from "@/utils/img-notfound"

interface ProductCardProps {
    product: {
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
    }
    isList?: boolean
    slug: string
}


export default function ProductCard(props: ProductCardProps) {
    // console.log("props", props)

    const { product, isList, slug } = props
    const {
        data: photoProductData,
    } = usePhotoProduct(product.gambar, product.id_user)
    const photoProduct = photoProductData?.data

    const _hargaJual = Number.isNaN(parseInt(product.harga_jual))
        ? 0
        : Number(product.harga_jual)

    return (
        <div className="h-full relative group rounded-3xl drop-shadow border-0 border-gray-50 bg-white overflow-hidden sm:hover:shadow">
            <div>
                <div
                    className={clsx(
                        isList ? "flex gap-2" : "block"
                    )}
                >
                    <div className="p-4">
                        <div className={clsx(
                            isList
                                ? "h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
                                : "aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 h-28 sm:h-44"
                        )}>
                            {photoProduct ? (
                                <Image
                                    src={photoProduct.data1}
                                    alt={photoProduct.data1}
                                    loader={({ src, width }) => `${src}?width=${width}`}
                                    width={700}
                                    height={475}
                                    className={clsx(
                                        isList
                                            ? "h-full w-full object-cover object-center"
                                            : "h-full w-full object-cover object-center group-hover:opacity-75"
                                    )}
                                />
                            ) : (
                                <Image
                                    src={blurImage}
                                    alt="Default"
                                    width={700}
                                    height={475}
                                    placeholder="blur"
                                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                    className={clsx(
                                        isList
                                            ? "h-full w-full object-cover object-center"
                                            : "h-full w-full object-cover object-center group-hover:opacity-75"
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    <div
                        className={clsx(
                            isList ? 'flex-1' : ''
                        )}
                    >
                        <div className={clsx(
                            'w-full h-full group-hover:opacity-80',
                            isList ? 'pr-3 py-4' : 'px-4 px-4 pb-4 pt-0'
                        )}>
                            <div>
                                <div>
                                    <h3 className={clsx(
                                        'font-medium text-gray-600 normal-case text-sm',
                                        isList ? '!leading-5' : '!leading-4'
                                    )}>
                                        {/* {product.jenis_produk === 'link' ? (
                                            <Link
                                                href={product.link ? product.link : '/'}
                                                className="w-full"
                                                target="_blank"
                                            >
                                                {product.nama_produk}
                                                <span aria-hidden="true" className="absolute inset-0" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={slug}
                                                className="w-full"
                                            >
                                                {product.nama_produk}
                                                <span aria-hidden="true" className="absolute inset-0" />
                                            </Link>
                                        )} */}
                                        <Link
                                            href={slug}
                                            className="w-full"
                                        >
                                            {product.nama_produk}
                                            <span aria-hidden="true" className="absolute inset-0" />
                                        </Link>
                                    </h3>
                                </div>

                                <div className={clsx(
                                    "flex mt-2",
                                    isList ? "flex-col justify-start" : "flex-col sm:flex-row justify-start sm:items-center sm:justify-between"
                                )}>
                                    {product.is_free_ongkir && (
                                        <div className="flex-1">
                                            <span className="bg-gray-400 py-1 px-2 rounded-md text-[10px] text-gray-50 !leading-3">Gratis ongkir</span>
                                        </div>
                                    )}

                                    {product.views && (
                                        <div>
                                            <div className="text-[10px] text-gray-600 font-medium !leading-4">Dilihat {product.views.view} kali</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <div className="text-sm font-medium !leading-none inline-block text-gray-600">
                                        {_hargaJual > 0 ? (
                                            <>
                                                {toIDR(product.harga_jual)}
                                            </>
                                        ): "Gratis"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {product.jenis_produk !== 'link' && (
                    <div className="absolute bottom-1.5 right-2">
                        <div className="p-3">
                            <div>
                                <Link
                                    href={`${props.slug}?cart=true`}
                                    className="w-full cursor-pointer"
                                >
                                    <ShoppingCartIcon className="inline-block h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}