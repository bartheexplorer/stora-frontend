"use client"

import { useCopyToClipboard } from "usehooks-ts"
import { toIDR } from "@/utils/to-idr"
import { CheckIcon } from "@radix-ui/react-icons"

interface VaProps {
    bank: string
    total: string
}

export default function Va(props: VaProps) {
    const [valueBank, copyBank] = useCopyToClipboard()
    const [valueAmount, copyAmount] = useCopyToClipboard()

    return (
        <div>
            <div className="px-8 mt-8">
                <div className="rounded-2xl border py-3 bg-gray-50/25 my-3 shadow px-5">
                    <p className="text-sm text-gray-800 font-semibold">Virtual Account</p>
                    <div className="py-2">
                        <div className="text-xs font-normal">No. Rekening:</div>
                        <div className="flex justify-between">
                            <div className="text-sm text-gray-800 font-semibold">{props.bank}</div>
                            <button
                            type="button"
                            className="text-xs font-normal text-stora-500 cursor-pointer"
                            onClick={() => {
                                if (props.bank) {
                                    const bankStr = props.bank.split(" ")
                                    copyBank(`${bankStr[0]}\n${bankStr[1]}`)
                                }
                            }}
                        >
                            {valueBank ? (
                                <div className="flex gap-1">
                                    <span>Salin</span>
                                    <CheckIcon />
                                </div>
                            ) : "Salin"}
                        </button>
                        </div>
                    </div>
                    <div className="pb-2">
                        <div className="text-xs font-normal">Total Pembayaran</div>
                        <div className="flex justify-between">
                            <div className="text-sm text-gray-800 font-semibold">{toIDR(props.total)}</div>
                            <button
                            type="button"
                            className="text-xs font-normal text-stora-500 cursor-pointer"
                            onClick={() => {
                                if (props.total) {
                                    copyAmount(props.total)
                                }
                            }}
                        >
                            {valueAmount ? (
                                <div className="flex gap-1">
                                    <span>Salin</span>
                                    <CheckIcon />
                                </div>
                            ) : "Salin"}
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}