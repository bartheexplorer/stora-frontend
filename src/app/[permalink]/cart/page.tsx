import { prisma } from "@/entry-server/config/db"
import { getCart } from "@/entry-server/services/carts"
import { getUser } from "@/entry-server/services/user"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { cookies } from "next/headers"
import Link from "next/link"
import PhotoProduct from "./components/photo-product"
import { toIDR } from "@/utils/to-idr"
import IFormQty from "./components/form-qty"
import BtnRemoveProduct from "./components/btn-remove-product"

interface CartProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

const toCarts = (carts: Awaited<ReturnType<typeof getCart>>) => {
    return carts?.carts.map((item) => {
        return {
            ...item
        }
    })
}

export default async function Cart(props: CartProps) {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartid")
    const user = await getUser(prisma, props.params.permalink)
    const cart = await getCart(prisma, {
        userId: user?.id_user.toString(),
        cartId: cartId?.value,
    })
    const carts = toCarts(cart)
    console.log("props", props)

    return (
        <div className="min-h-screen">
            <div className="w-full px-6 py-4 shadow mb-2">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={`/${props.params.permalink}`}
                        className="rounded-full bg-gray-50"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        {!!user && (
                            <span className="text-xs font-semibold tracking-wide capitalize">
                                {user.setting?.permalink
                                    ? user.setting.permalink
                                    : user.setting?.nama_toko
                                        ? user.setting.nama_toko
                                        : "Stora"}
                            </span>
                        )}
                    </div>
                    <div></div>
                </div>
            </div>

            {(Array.isArray(carts) && carts.length > 0) ? (
                <>
                    <div className="mt-8 px-8 sm:px-12">
                        <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-gray-200 pb-32">
                                {carts.map((item) => {
                                    return (
                                        <li key={item.id_keranjang} className="flex py-6">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <PhotoProduct
                                                    images={item.gambar_produk}
                                                    user_id={user?.id_user.toString() || ""}
                                                />
                                            </div>
                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-xs font-medium text-gray-900">
                                                        <h3>
                                                            <a href="/">{item.nama_produk}</a>
                                                        </h3>
                                                        <p className="ml-4">{toIDR(item.total.toString())}</p>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {item.varian.length > 0 ? `${item.varian} ` : ""}
                                                        {item.ukuran.length > 0 ? `${item.ukuran}` : ""}
                                                    </p>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-xs">
                                                    <p className="text-gray-500">Qty {item.qty}</p>

                                                    <div className="flex gap-3">
                                                        <IFormQty
                                                            cartId={item.id_keranjang.toString()}
                                                            qty={item.qty.toString()}
                                                        />
                                                        <BtnRemoveProduct
                                                            cartId={item.id_keranjang.toString()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="fixed bottom-0 z-40 inset-x-0 pb-8 sm:pb-6">
                        <div className="w-full max-w-lg mx-auto px-6 sm:px-8">
                            <div className="h-12 flex items-center justify-between bg-stora-500 rounded-lg px-3 shadow">
                                <span className="text-sm tracking-wide text-white">
                                    {toIDR(carts.reduce((item, i) => (i.total + item), 0).toString())}
                                </span>
                                <Link
                                    href={`/${props.params.permalink}/cart/${cartId?.value}?_id=${(Math.floor(Math.random() * 900) + 100).toString()}`}
                                    className="inline-flex items-center justify-center rounded-lg px-4 text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default"
                                >
                                    Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                </>
            ) : (
                <p className="text-center mt-12">Data tidak ditemukan.</p>
            )}
        </div>
    )
}