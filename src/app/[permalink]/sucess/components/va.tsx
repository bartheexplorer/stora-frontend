import { toIDR } from "@/utils/to-idr"

interface VaProps {
    bank: string
    total: string
}

export default function Va(props: VaProps) {
    return (
        <div>
            <div className="px-8 mt-8">
                <div className="rounded-2xl border py-3 bg-gray-50/25 my-3 shadow px-5">
                    <p className="text-sm text-gray-800 font-semibold">Virtual Account</p>
                    <div className="py-2">
                        <div className="text-xs font-normal">No. Rekening:</div>
                        <div className="flex justify-between">
                            <div className="text-sm text-gray-800 font-semibold">{props.bank}</div>
                            <span className="text-green-500 text-xs">Salin</span>
                        </div>
                    </div>
                    <div className="pb-2">
                        <div className="text-xs font-normal">Total Pembayaran</div>
                        <div className="flex justify-between">
                            <div className="text-sm text-gray-800 font-semibold">{toIDR(props.total)}</div>
                            <span className="text-green-500 text-xs">Salin</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}