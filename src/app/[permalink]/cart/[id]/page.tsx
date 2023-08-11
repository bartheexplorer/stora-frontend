import { prisma } from "@/entry-server/config/db"
import { getCart } from "@/entry-server/services/carts"
import { getUser } from "@/entry-server/services/user"
import { toIDR } from "@/utils/to-idr"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import PhotoProduct from "./components/photo-product"
import dynamic from "next/dynamic"
import ILoading from "./components/loading"

const IFormCheckout = dynamic(() => import("./components/form-checkout"), {
    ssr: false,
    loading: () => (
        <div className="px-8 sm:px-12">
            <h3 className="mb-2">Checkout</h3>
            <ILoading text="Loading..." />
        </div>
    )
})

interface CartIdProps {
    params: {
        permalink: string
        id: string
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

export default async function CartId(props: CartIdProps) {
    const user = await getUser(prisma, props.params.permalink)
    const cart = await getCart(prisma, {
        userId: user?.id_user.toString(),
        cartId: props.params.id,
    })
    const carts = toCarts(cart)

    if (!cart?.carts) return null

    return (
        <div className="min-h-screen">
            <div className="w-full px-4 py-3">
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

            <div className="py-4 px-12">
                <h3 className="text-sm font-semibold text-slate-600">Checkout</h3>
            </div>

            {(Array.isArray(carts) && carts.length > 0) && (
                <>
                    <div className="mt-8 px-8 sm:px-12">
                        <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-gray-200 pb-4">
                                {carts.map((item) => {
                                    return (
                                        <li key={item.id_keranjang} className="flex py-6">
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
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
                                                    <p className="mt-1 text-xs text-gray-500">{item.varian} {item.ukuran}</p>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-xs">
                                                    <p className="text-gray-500">Qty {item.qty}</p>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </>
            )}

            {(!!user && !!user.setting) && (
                <IFormCheckout
                    user={{
                        name: user?.nama_lengkap,
                        no_hp: user?.setting?.no_hp_toko,
                        user_id: user?.id_user.toString(),
                        member_id: user?.user_id.toString(),
                    }}
                    permalink={props.params.permalink}
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
                />
            )}
            

            {JSON.stringify(props, undefined, 2)}
        </div>
    )
}