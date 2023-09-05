import { prisma } from "@/entry-server/config/db"
import { getCart } from "@/entry-server/services/carts"
import { getUser } from "@/entry-server/services/user"
import { toIDR } from "@/utils/to-idr"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import PhotoProduct from "./components/photo-product"
import dynamic from "next/dynamic"
import ILoading from "./components/loading"
import { sumTotal } from "@/utils/add-decimal"

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
    const permalink = props.params.permalink

    function _slugToTitle(slug: string): string {
        const words = slug.split('-'); // Split the slug into words using dashes
        const titleWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize each word

        return titleWords.join(' '); // Join the words back together with spaces
    }

    const _permak_link = _slugToTitle(permalink)

    const user = await getUser(prisma, _permak_link)
    const cart = await getCart(prisma, {
        userId: user?.id_user.toString(),
        cartId: props.params.id,
    })
    const carts = toCarts(cart)

    const _digitalProduct = ["digital"]
    const _fisikProduct = ["fisik"]

    const _isDigitalArray = carts?.filter((item) => _digitalProduct.includes(item.jenis_produk))
    const _isFisikArray = carts?.filter((item) => _fisikProduct.includes(item.jenis_produk))
    // const _isFreeOngkirArray = carts?.filter((item) => ["1"].includes(item.is_free_ongkir))
    const _isNoFreeOngkirArray = carts?.filter((item) => ["0"].includes(item.is_free_ongkir))
    
    const _isFisik = carts?.find((item) => _fisikProduct.includes(item.jenis_produk))
    // const _isFreeOngkir = carts?.find((item) => ["1"].includes(item.is_free_ongkir))

    let _isFreeOngkir = false
    let _showShipping = false

    if (Array.isArray(_isNoFreeOngkirArray) && _isNoFreeOngkirArray.length > 0) {
        _isFreeOngkir = false
        _showShipping = true
        console.log("_isNoFreeOngkirArray")
    }

    if (Array.isArray(_isDigitalArray) && _isDigitalArray.length > 0) {
        _isFreeOngkir = true
        _showShipping = false
        console.log("_isDigitalArray")
    }

    if (Array.isArray(_isFisikArray) && _isFisikArray.length > 0) {
        const _isFreeOngkirFind = carts?.find((item) => ["1"].includes(item.is_free_ongkir))
        // _isFreeOngkir = !!_isFreeOngkirFind
        _isFreeOngkir = !!_isFreeOngkirFind
        _showShipping = !!_isFreeOngkirFind
        if (Array.isArray(_isNoFreeOngkirArray) && _isNoFreeOngkirArray.length > 0) {
            _isFreeOngkir = false
            _showShipping = true
        }
        console.log("_isFisikArray")
        // const _is_fisik = carts?.find((item) => _fisikProduct.includes(item.jenis_produk))
        // if (_is_fisik) {

        // }
    }

    // if (Array.isArray(_isFreeOngkirArray) && _isFreeOngkirArray.length > 0) {
    //     console.log("_isFreeOngkirArray")
    // }

    console.log("_isDigitalArray", _isDigitalArray)
    console.log("_isFisikArray", _isFisikArray)
    // console.log("_isFreeOngkirArray", _isFreeOngkirArray)
    console.log("_isNoFreeOngkirArray", _isNoFreeOngkirArray)
    console.log("carts", carts)

    console.log("_isFreeOngkir", _isFreeOngkir)

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
                    <div className="py-4 px-12">
                        <h3 className="text-sm font-semibold text-slate-600">Checkouts</h3>
                    </div>

                    {(Array.isArray(carts) && carts.length > 0) && (
                        <>
                            <div className="px-8 sm:px-12">
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
                                                            {(item.varian || item.ukuran) && (
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {item.varian.length > 0 ? `Variasi: ${item.varian}` : ""}
                                                                    {item.ukuran.length > 0 ? `Ukuran: ${item.ukuran}` : ""}
                                                                </p>
                                                            )}
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
                            cartId={props.params.id}
                            product={{
                                weight: carts
                                    ? carts.reduce((sum, item) => (sumTotal(sum.toString(), item.berat.toString())), 0)
                                    : 0,
                                showShipping: _showShipping,
                                isFreeOngkir: _isFreeOngkir,
                                isFree: false,
                                total: carts
                                    ? carts.reduce((sum, item) => (sumTotal(sum.toString(), item.total.toString())), 0)
                                    : 0,
                                discount: carts
                                    ? carts.reduce((sum, item) => (sumTotal(sum.toString(), item.potongan ? item.potongan.toString() : "0")), 0)
                                    : 0,
                                typeProduct: _isFisik?.jenis_produk || ""
                            }}
                            user={{
                                name: user?.nama_lengkap,
                                no_hp: user?.setting?.no_hp_toko,
                                user_id: user?.id_user.toString(),
                                member_id: user?.user_id.toString(),
                            }}
                            codeUnique={Boolean(user.setting.status_kode_unik === "SATU")}
                            permalink={props.params.permalink}
                            payment={{
                                transfer: user?.banks ? user.banks.map((item) => ({
                                    id_bank: item.id_bank.toString(),
                                    bank: item.bank,
                                    rekening: item.rekening,
                                    pemilik: item.pemilik,
                                    is_active: Boolean(item.is_active === "SATU"),
                                })) : [],
                                va: user?.xendits_va ? user.xendits_va.map((item) => ({
                                    id_bank_va_xendit: item.id_bank_va_xendit.toString(),
                                    bank_code: item.bank_code,
                                    is_active: Boolean(item.is_active === "SATU"),
                                })) : [],
                                settings: user?.xendits ? user.xendits.map((item) => ({
                                    id_setting_xendit: item.id_setting_xendit.toString(),
                                    business_name: item.business_name,
                                    country: item.country,
                                    is_active: Boolean(item.is_active === "SATU"),
                                    is_blocked: Boolean(item.is_blocked === "SATU"),
                                    status_qris: Boolean(item.status_qris === "SATU"),
                                    status_va: Boolean(item.status_va === "SATU"),
                                    fee: item.fee,
                                })) : [],
                            }}
                        />
                    )}
                </>
            ) : (
                <div className="py-12">
                    <p className="text-center text-xs font-semibold text-gray-700">Data tidak ditemukan</p>
                </div>
            )}
        </div>
    )
}