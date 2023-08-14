import { prisma } from "@/entry-server/config/db"
import { findOrderById } from "@/entry-server/services/order"
import { getUser } from "@/entry-server/services/user"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import Tf from "./components/tf"
import Va from "./components/va"
import Cod from "./components/cod"
import Qris from "./components/qris"

interface SuccessProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Success(props: SuccessProps) {
    const user = await getUser(prisma, props.params.permalink)
    const order = await findOrderById(prisma, props.searchParams?.id?.toString())

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

            {!!order && (
                <div>
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
                        />
                    )}

                    {order.payment === "virtual" && (
                        <Va
                            bank={order.bank}
                            total={order.totalbayar.toString()}
                        />
                    )}

                    {order.payment === "qris" && (
                        <Qris />
                    )}

                    {order.payment === "cod" && (
                        <Cod
                            qty={order.qty.toString()}
                            price={order.harga_jual.toString()}
                            ongkir={order.ongkir ? order.ongkir.toString() : "0"}
                            total={order.totalbayar.toString()}
                        />
                    )}
                </div>
            )}

            <pre>{JSON.stringify(order, undefined, 2)}</pre>
        </div>
    )
}