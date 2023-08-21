"use client"

import Image from "next/image"
import { useSession } from "./use-session"

export default function SessionContent({ permalink }: { permalink: string }) {
    const {
        data: sessionQr,
        isLoading: loadingSession,
    } = useSession(permalink)

    const _data = sessionQr?.data

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-t from-[#623C98] from-10% via-[#623C98] via-30% to-[#5D3891]/80 to-90%">
            <div className="mx-auto relative h-[99px] w-[119px] overflow-hidden mt-[62px] mb-4">
                <Image
                    src="/images/stora.png"
                    width={700}
                    height={700}
                    alt="Stora logo"
                    priority
                    className="w-full h-full object-center"
                />
            </div>

            <div className="relative rounded-xl overflow-hidden h-[419px] mb-6">
                <div className="absolute inset-0 w-[367px] mx-auto bg-no-repeat bg-center h-full bg-[url(/images/frame-qr.svg)]"></div>
                {loadingSession && (
                    <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-8 w-8 text-slate-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                {!!_data?.qr ? (
                    <>
                        <div className="flex items-center justify-center h-full">
                            <Image
                                src={_data.qr}
                                width={700}
                                height={700}
                                alt="Scan qr"
                                priority
                                className="w-[307px] h-[307px] inset-0 object-center"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <h3 className="text-white text-sm font-medium tracking-wide">Session tidak ditemukan</h3>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center">
                <button
                    type="button"
                    className="bg-white rounded-lg text-stora-600 text-center font-semibold w-[161px] h-[40px]"
                >
                    Scan
                </button>
            </div>
        </div>
    )
}