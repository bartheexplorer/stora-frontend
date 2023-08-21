"use client"

import QRCode from "qrcode"
import { toIDR } from "@/utils/to-idr"
import Image from "next/image"
import powerByQris from "@/app/assets/e-wallet/iconQris 1.png"
import ovo from "@/app/assets/e-wallet/Logo_ovo_purple.png"
import shopee from "@/app/assets/e-wallet/Logo ShopeePay.png"
import dana from "@/app/assets/e-wallet/Logo_dana_blue-asli.png"
import link from "@/app/assets/e-wallet/link-aja.png"
import goPy from "@/app/assets/e-wallet/logo-gopay-vector-asli.png"
import { useEffect, useState } from "react"

const iconBank = [
    {
        id: 1,
        name: 'ovo',
        icon: ovo,
        desc: '',
        w: 30,
        h: 30,
    },
    {
        id: 2,
        name: 'shopee',
        icon: shopee,
        desc: '',
        w: 40,
        h: 50,
    },
    {
        id: 3,
        name: 'dana',
        icon: dana,
        desc: '',
        w: 40,
        h: 40,
    },
    {
        id: 4,
        name: 'link',
        icon: link,
        desc: '',
        w: 18,
        h: 18,
    },
    {
        id: 5,
        name: 'go pay',
        icon: goPy,
        desc: '',
        w: 45,
        h: 45,
    },
]

export default function Qris({
    bank,
    no_pesanan,
    total_bayar,
}: {
    bank: string
    no_pesanan: string
    total_bayar: string
}) {

    const [qr, setQr] = useState("")
    useEffect(() => {
        const generateQR = async (text: string) => {
            try {
                const qr = await QRCode.toString(
                    text,
                    {
                        errorCorrectionLevel: "H",
                    }
                )
                setQr(qr)
            } catch (err) {
            }
        }
        generateQR(bank)
    }, [bank])

    const createMarkup = (value: string) => {
        return {
          __html: value,
        }
      }
    
    return (
        <div className="py-12">
            <div className="text-center my-5">
                <h3 className="font-semibold text-sm">Scan QR Code To Pay</h3>
                <h3 className="font-semibold text-sm">Total Pembayaran</h3>
                <h3 className="font-semibold text-sm">{toIDR(total_bayar)}</h3>
            </div>

            <div className="px-10">
                <div className="p-6 rounded-2xl shadow">
                    <div className="flex items-center justify-center">
                        <div
                            className="w-full sm:w-64 h-full"
                            dangerouslySetInnerHTML={createMarkup(qr)}
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <div>
                            <span className="text-[10px] font-bold">Powered By</span>
                        </div>
                        <div>
                            <Image
                                src={powerByQris}
                                alt="powerby"
                                width={75}
                                height={75}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <ul className="flex items-center justify-center gap-4">
                            {iconBank.map((item) => {
                                return (
                                    <li key={item.id} className="">
                                        <Image
                                            src={item.icon}
                                            alt={item.name}
                                            width={item.w}
                                            height={item.h}
                                            className="mt-1"
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}