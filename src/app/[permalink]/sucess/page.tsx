import { prisma } from "@/entry-server/config/db"
import { findOrderById, getMultiOrder } from "@/entry-server/services/order"
import { getUser } from "@/entry-server/services/user"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import Tf from "./components/tf"
import Va from "./components/va"
import Cod from "./components/cod"
import Qris from "./components/qris"
import { findBankByNorek } from "@/entry-server/services/bank"

interface SuccessProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Success(props: SuccessProps) {
    const permalink = props.params.permalink

    function _slugToTitle(slug: string): string {
        const words = slug.split('-'); // Split the slug into words using dashes
        const titleWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize each word

        return titleWords.join(' '); // Join the words back together with spaces
    }

    const _permak_link = _slugToTitle(permalink)
    const user = await getUser(prisma, _permak_link)
    const order = await findOrderById(prisma, props.searchParams?.id?.toString())
    const multiOrder = await getMultiOrder(prisma, props.searchParams?.id?.toString())
    const _paymentIsBank = order?.payment === "bank"
    const _rek = _paymentIsBank
        ? order.bank.split("- ").at(1)
        : ""
    const _bank = await findBankByNorek(prisma, {
        rekening: _rek ? _rek.trimStart() : "-",
        id_user: order?.id_user || 0,
    })

    return (
        <div className="min-h-screen">
            <div className="w-full px-6 py-4 shadow mb-2">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={`/${permalink}`}
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

            {!!order ? (
                <>
                    {!!!order.payment && (
                        <div className="p-12">
                            <div className="p-6 rounded-xl bg-slate-200">
                                <h3 className="text-gray-500 font-semibold">Terimakasih telah melakukan pemesanan</h3>
                            </div>
                        </div>
                    )}

                    {order.payment === "bank" && (
                        <Tf
                            bank={order.bank}
                            total={order.totalbayar.toString()}
                            name={_bank?.pemilik}
                        />
                    )}

                    {order.payment === "virtual" && (
                        <Va
                            bank={order.bank}
                            total={order.totalbayar.toString()}
                        />
                    )}

                    {order.payment === "qris" && (
                        <Qris
                            bank={order.bank}
                            no_pesanan={order.order_id}
                            total_bayar={order.totalbayar.toString()}
                        />
                    )}

                    {order.payment === "cod" && (
                        <Cod
                            qty={order.qty.toString()}
                            price={order.harga_jual.toString()}
                            ongkir={order.ongkir ? order.ongkir.toString() : "0"}
                            total={order.totalbayar.toString()}
                        />
                    )}
                </>
            ) : (
                <>
                    {!!multiOrder ? (
                        <>
                            {!!!multiOrder.payment && (
                                <div className="p-12">
                                    <div className="p-6 rounded-xl bg-slate-200">
                                        <h3 className="text-gray-500 font-semibold">Terimakasih telah melakukan pemesanan</h3>
                                    </div>
                                </div>
                            )}

                            {multiOrder.payment === "bank" && (
                                <Tf
                                    bank={multiOrder.bank}
                                    total={multiOrder.totalbayar.toString()}
                                />
                            )}

                            {multiOrder.payment === "virtual" && (
                                <Va
                                    bank={multiOrder.bank}
                                    total={multiOrder.totalbayar.toString()}
                                />
                            )}

                            {multiOrder.payment === "qris" && (
                                <Qris
                                    bank={multiOrder.bank}
                                    no_pesanan={multiOrder.order_id}
                                    total_bayar={multiOrder.totalbayar.toString()}
                                />
                            )}

                            {multiOrder.payment === "cod" && (
                                <Cod
                                    qty="0"
                                    price={multiOrder.totalbayar.toString()}
                                    ongkir={multiOrder.ongkir ? multiOrder.ongkir.toString() : "0"}
                                    total={multiOrder.totalbayar.toString()}
                                />
                            )}
                        </>
                    ) : (
                        <div className="p-12">
                            <div className="p-6 rounded-xl bg-slate-200">
                                <h3 className="text-gray-500 font-semibold">Terimakasih telah melakukan pemesanan</h3>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}