import { toIDR } from "@/utils/to-idr"

interface CodProps {
    qty: string
    price: string
    ongkir: string
    total: string
}

export default function Cod(props: CodProps) {
    return (
        <div>
            <div className="mt-4 px-8">
                <div className="rounded-xl shadow bg-yellow-200/25 px-3 py-2">
                    <p className="text-sm">Lakukan pembayaran ke kurir setelah menerima barang.</p>
                </div>
            </div>

            <div className="px-8 mt-3">
                <div className="rounded-xl shadow px-3 py-3">
                    <div className="w-full flex flex-col gap-3">
                        <p className="text-sm font-semibold border-b-2">Bayar di tempat</p>

                        <div className="flex justify-between">
                            <div className="text-sm font-semibold text-gray-800">
                                Harga {`${props.qty !== "0" ? `(${props.qty} Barang)` : "0"}`}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">{toIDR(props.price)}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-sm font-semibold text-gray-800">Biaya Kirim</div>
                            <div className="text-sm font-semibold text-gray-800">{toIDR(props.ongkir)}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-sm font-semibold text-gray-800">Biaya bayar di Tempat</div>
                            <div className="text-sm font-semibold text-gray-800">Rp0</div>
                        </div>
                        <div className="mt-2 border-t-2">
                            <div className="flex justify-between">
                                <div className="text-sm font-semibold text-gray-800">Total Tagihan</div>
                                <div className="text-sm font-semibold text-gray-800">{toIDR(props.total)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}