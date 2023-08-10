import { useForm } from "react-hook-form"
import { type IFormValueCoupon, IFormValueCouponSchema } from "./form-coupon-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCoupon } from "@/hooks/coupon"
import ILoading from "../loading"
import { toIDR } from "@/utils/to-idr"

interface IFormCouponProps {
    product_id: string
    permalink: string
    price: number
    applyCoupon: (data: {
        discount: number
        coupon: string
    }) => void
}

export default function IFormCoupon(props: IFormCouponProps) {
    const {
        sendRequest: getCoupon,
        data: dataCoupon,
        isLoading: loadingCoupon,
    } = useCoupon()
    const {
        handleSubmit,
        register,
    } = useForm<IFormValueCoupon>({
        resolver: zodResolver(IFormValueCouponSchema)
    })

    const onHandleSubmit = handleSubmit(async (data) => {
        await getCoupon({
            product_id: props.product_id,
            permalink: props.permalink,
            coupon: data.kode_coupon,
        })
    })

    const coupon_data = dataCoupon?.data

    return (
        <div className="py-4 px-6">
            <form onSubmit={(event) => {
                onHandleSubmit(event)
                if (event) {
                    if (typeof event.preventDefault === "function") {
                        event.preventDefault()
                    }
                    if (typeof event.stopPropagation === "function") {
                        event.stopPropagation()
                    }
                }
            }}>
                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="kode_coupon">
                        Kode Kupon
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input
                                {...(register("kode_coupon", { required: true }))}
                                className="w-full grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                placeholder="Kode Kupon"
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-[60px] h-[40px] text-sm text-white rounded-lg shadow bg-stora-500">
                                Cek
                            </button>
                        </div>
                    </div>
                    {!!dataCoupon?.error && (
                        <p className="text-xs text-red-500">Data tidak ditemukan</p>
                    )}
                </fieldset>
                {loadingCoupon && (
                    <ILoading />
                )}
                {!!coupon_data && (
                    <>
                        <div className="mb-3">
                            <div className="rounded-lg bg-slate-100 shadow p-3">
                                <div>
                                    <h4 className="text-sm text-slate-500">Diskon</h4>
                                    {coupon_data?.tipe === "persen" ? (
                                        <p className="text-xs">{`${coupon_data?.diskon}%`}</p>
                                    ) : (
                                        <p className="text-xs">{`${toIDR(coupon_data?.diskon)}`}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="py-1">
                            <button
                                type="button"
                                className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                                onClick={() => {
                                    const diskon = Number(coupon_data?.diskon)
                                    const price = props.price
                                    const coupon = coupon_data.kupon as string
                                    if (coupon_data?.tipe === "persen") {
                                        const total = Number((price * diskon) / 100)
                                        props.applyCoupon({
                                            coupon,
                                            discount: total,
                                        })
                                    } else {
                                        const total = Number(diskon)
                                        props.applyCoupon({
                                            coupon,
                                            discount: total,
                                        })
                                    }
                                }}
                            >
                                Terapkan
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    )
}