import { toIDR } from "@/utils/to-idr"

interface TfProps {
    bank: string
    total: string
}

export default function Tf(props: TfProps) {
    return (
        <div>
            <div className="mt-8 bg-gray-50/25 my-3 shadow px-12">
                <p className="text-sm text-gray-800 font-semibold">Transfer Bank</p>
                <div className="py-2">
                    <div className="text-xs font-normal">No. Rekening:</div>
                    <div className="flex justify-between">
                        <div className="text-sm text-gray-800 font-semibold">{props.bank}</div>
                        <span className="text-xs font-normal text-green-500">Salin</span>
                    </div>
                </div>
                <div className="pb-2">
                    <div className="text-xs font-normal">Total Pembayaran</div>
                    <div className="flex justify-between">
                        <div className="text-sm text-gray-800 font-semibold">{toIDR(props.total)}</div>
                        <span className="text-xs font-normal text-green-500">Salin</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 py-4 px-12 mb-4">
                <div className="flex flex-col">
                    <p className="text-gray-800 font-semibold text-sm">Penting</p>
                    <div className="px-8 text-xs">
                        <ul className="list-disc list-outside text-slate-900 text-justify">
                            <li>Transfer tepat hingga 3 digit terahir</li>
                            <li>Demi keamanan transaksi, jangan berikan bukti transfer pada siapapun.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-blue-50 py-4 px-12">
                <div>
                    <div className="py-3 px-8">
                        <ul className="list-decimal list-outside text-slate-900 text-xs text-justify">
                            <li>Lakukan pembayaran melalui ATM / mobile banking / internet banking / SMS banking / kantor bank terdekat</li>
                            <li>Isi nomor rekening tujuan sesuai yang ada di halaman, Menunggu, Pembayaran (a.n. KlikDigital)</li>
                            <li>Masukkan nominal pembayaran sesuai jumlah tagihanmu, termasuk 3 digit terahir</li>
                            <li>Pembayaran akan diverifikasi oleh KlikDigital waktu verifikasi paling lambat 1x24 jam di hari kerja jika antar bank yang berbeda.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}