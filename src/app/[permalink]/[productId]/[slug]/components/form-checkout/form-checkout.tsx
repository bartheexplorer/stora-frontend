"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { IFormValueCheckoutSchema, type IFormValueCheckout } from "./form-checkout-type"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Dialog from "@radix-ui/react-dialog"
import { CaretRightIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useContext, useEffect, useRef, useState } from "react"
import IFormAddressArveoli from "./form-address-arveoli"
import { toIDR } from "@/utils/to-idr"
import { OrderContext } from "@/context/order"
import clsx from "clsx"
import { getRandomThreeDigitNumber } from "@/utils/get-rand-number"
import { multiplySubTotal, subtractTotal, sumTotal } from "@/utils/add-decimal"
import IFormCoupon from "./form-coupon"
import { getLastThreeWords } from "@/utils/get-unik-code"
import * as Toast from "@radix-ui/react-toast"

const RAND_CODE = getRandomThreeDigitNumber()

interface IFormCheckoutProps {
    permalink: string
    variations: {
        id: string
        name: string
    }[]
    sizes: {
        id: string
        name: string
        price: string
    }[]
    product: {
        productName: string
        price: number
        userId: string
        isFree: boolean
        isFreeOngkir: boolean
        weight: string
        productId: string
        typeProduct: string
        textBtnOrder: string
        customFields: {
            id: string
            idx: number
            label: string
            field: "input" | "select" | "textarea"
            is_option: boolean
            options: {
                id: string
                value: string
            }[]
            placeholder: string
            required: boolean
            type: "text" | "date" | "email" | "number" | "url"
        }[]
    }
    payment: {
        transfer: {
            id_bank: string
            bank: string
            rekening: string
            pemilik: string
            is_active: boolean
        }[]
        va: {
            id_bank_va_xendit: string
            bank_code: string
            is_active: boolean
        }[]
        settings: {
            id_setting_xendit: string
            business_name: string
            country: string
            is_active: boolean
            is_blocked: boolean
            status_qris: boolean
            status_va: boolean
            fee: "seller" | "customer" | null
        }[]
    }
    codeUnique: boolean
}

export default function IFormCheckout({
    permalink,
    variations,
    sizes,
    product,
    payment,
    codeUnique,
}: IFormCheckoutProps) {
    const { shippingArveoli } = useContext(OrderContext)
    const [isOpenCoupon, setIsOpenCoupon] = useState<boolean>(false)
    const [isOpenAddress, setIsOpenAddress] = useState<boolean>(false)
    const [isOpenShipping, setIsOpenShipping] = useState<boolean>(false)
    const [isOpenPayment, setIsOpenPayment] = useState<boolean>(false)
    const [currentPayment, setCurrentPayment] = useState<{
        id: string
        payment_method: string
        account?: string
        bank?: string
        name?: string
    } | null>(null)
    const [couponData, setCouponData] = useState<{
        discount: number
        coupon?: string | null
    } | null>(null)
    const [checkout, setCheckout] = useState<{
        price: number
        afterPrice: number
        subTotal: number
        total: number
        qty: number
        randCode: number
        ongkir: number
    }>({
        total: Math.round(Number(product.price + RAND_CODE)),
        subTotal: product.price,
        price: product.price,
        afterPrice: product.price,
        qty: 1,
        randCode: codeUnique ? RAND_CODE : 0,
        ongkir: 0,
    })
    const [address, setAddress] = useState<{
        province: string
        regency: string
        id_mapping: string
        sub_district: string
        urban_village: string
        zip_code: string
        address: string
        shipping: {
            service_code: string
            service_name: string
            price: string | number
            etd: string
            discount_price: string | number
            cashless_discount_price: string | number
            s_name: any
        } | null
    } | null>(null)
    const [openAlert, setAlertOpen] = useState(false)
    const eventAlertRef = useRef<string | null>(null)
    const timerRef = useRef(0)
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
    } = useForm<IFormValueCheckout>({
        resolver: zodResolver(IFormValueCheckoutSchema),
        defaultValues: {
            custom_fields: product.customFields.map((item) => ({
                label: item.label,
                value: "",
                field: item.field.toString(),
                required: item.required,
                placeholder: item.placeholder,
                options: item.options,
            })),
            jumlah: "1",
        }
    })

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, [])

    const { fields } = useFieldArray({ control, name: "custom_fields" })

    const submitAction = handleSubmit((data) => {
        console.log("FORM UTAMA RENDER")
        setAlertOpen(false)
        if ((Array.isArray(variations) && variations.length > 0)) {
            if (!data.variasi || typeof data.variasi !== "string") {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum memilih variasi"
                    setAlertOpen(true)
                }, 100)
                return
            }
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            if (!data.ukuran || typeof data.ukuran !== "string") {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum memilih ukuran"
                    setAlertOpen(true)
                }, 100)
                return
            }
        }

        if (!product.isFree) {
            if (!data.payment?.id || typeof data.payment.id !== "string") {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum memilih metode pembayaran"
                    setAlertOpen(true)
                }, 100)
                return
            }
        }

        if (!address) {
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                eventAlertRef.current = "Belum mengisi alamat"
                setAlertOpen(true)
            }, 100)
            return
        }

        console.log(data)
    })

    const onOpenAddressChange = (value: boolean) => {
        setIsOpenAddress(value)
    }

    const onOpenShippingChange = (value: boolean) => {
        setIsOpenShipping(value)
    }

    const num = (length: number = 50) => {
        const array: number[] = []
        for (let index = 1; index <= length; index++) {
            array.push(index);
        }

        return array.map((item) => (<option key={item} value={item}>{item}</option>))
    }

    const getPaymentMethod = (currentPayment: {
        id: string
        payment_method: string
        account?: string
        bank?: string
        name?: string
    }) => {
        if (currentPayment.payment_method === "tf") {
            return (
                <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs">
                        Transfer bank
                    </span>
                    <span className="text-xs">{currentPayment?.bank}</span>
                </div>
            )
        }

        if (currentPayment.payment_method === "va") {
            return (
                <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs">
                        Virtual account
                    </span>
                    <span className="text-xs">{currentPayment?.account}</span>
                </div>
            )
        }

        if (currentPayment.payment_method === "COD") {
            return (
                <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs">
                        COD
                    </span>
                </div>
            )
        }

        if (currentPayment.payment_method === "QRIS") {
            return (
                <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                    <span className="text-xs">
                        QRIS
                    </span>
                </div>
            )
        }

        return null
    }

    const shippingArveoliMap = () => {
        const shipping = []
        if (shippingArveoli?.data) {
            for (const [key, array] of Object.entries(shippingArveoli.data)) {
                shipping.push({
                    id: key,
                    options: (Array.isArray(array) && array.length > 0)
                        ? array
                        : []
                })
            }
        }

        return (Array.isArray(shipping) && shipping.length > 0)
            ? (
                <>
                    <ul className="px-6 my-4 space-y-3">
                        {shipping.map((item) => {
                            const s_name = item.id
                            return (
                                <li key={item.id}>
                                    {(Array.isArray(item.options) && item.options.length > 0) && (
                                        <>
                                            <h4 className="uppercase text-xs font-semibold tracking-wide mb-2">{s_name}</h4>
                                            <ul className="flex flex-wrap gap-3">
                                                {item.options.map((item) => {
                                                    return (
                                                        <li
                                                            key={item.service_code}
                                                            className={clsx(
                                                                "relative p-2 bg-gray-100 rounded-lg shadow border hover:border-stora-500",
                                                                item.service_code === address?.shipping?.service_code
                                                                    ? "border-stora-500"
                                                                    : "border-transparent"
                                                            )}
                                                        >
                                                            <p className="text-xs text-gray-800 mb-1.5">{item.service_name}</p>
                                                            {!!item.price && (
                                                                <p className="text-xs text-gray-800 mb-1.5">{toIDR(item.price.toString())}</p>
                                                            )}
                                                            <p className="text-xs text-gray-800">{item.etd}</p>
                                                            <button
                                                                type="button"
                                                                className="absolute inset-0"
                                                                onClick={(event) => {
                                                                    const ongkir = Number(item.price)

                                                                    // set_address
                                                                    setAddress((prevState) => {
                                                                        if (!prevState) return prevState
                                                                        return {
                                                                            ...prevState,
                                                                            shipping: {
                                                                                ...(prevState?.shipping ? prevState.shipping : {}),
                                                                                s_name,
                                                                                service_code: item.service_code,
                                                                                service_name: item.service_name,
                                                                                price: ongkir,
                                                                                etd: item.etd,
                                                                                discount_price: Number(item.discount_price),
                                                                                cashless_discount_price: Number(item.cashless_discount_price),
                                                                            }
                                                                        }
                                                                    })
                                                                    // set_checkout
                                                                    setCheckout((prevState) => {
                                                                        const totalOngkir = sumTotal(
                                                                            prevState.subTotal.toString(),
                                                                            ongkir.toString()
                                                                        )
                                                                        const totalRand = sumTotal(
                                                                            totalOngkir.toString(),
                                                                            prevState.randCode.toString()
                                                                        )
                                                                        const totalCoupon = subtractTotal(
                                                                            totalRand.toString(),
                                                                            (couponData?.discount || 0).toString()
                                                                        )
                                                                        return {
                                                                            ...prevState,
                                                                            ongkir,
                                                                            total: totalCoupon,
                                                                        }
                                                                    })
                                                                    if (event) {
                                                                        if (typeof event.preventDefault === "function") {
                                                                          event.preventDefault()
                                                                        }
                                                                        if (typeof event.stopPropagation === "function") {
                                                                          event.stopPropagation()
                                                                        }
                                                                    }
                                                                }}
                                                            >&nbsp;</button>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>

                    <div className="py-6 flex flex-col">
                        <button
                            type="button"
                            className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                            onClick={() => {
                                if (address?.id_mapping) {
                                    setIsOpenShipping(false)
                                }
                            }}
                        >Simpan</button>
                    </div>
                </>
            ) : null
    }

    const paymentComponent = () => {
        return (
            <div className="px-6">
                <Controller
                    name="payment"
                    control={control}
                    render={({ field }) => {
                        const { onChange, value } = field

                        return (
                            <>
                                {(Array.isArray(payment.transfer) && payment.transfer.length > 0) && (
                                    <div className="py-2">
                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Transfer</h3>
                                        <ul className="flex flex-wrap gap-3">
                                            {payment.transfer.map((item) => {
                                                return item.is_active ? (
                                                    <li
                                                        key={item.id_bank}
                                                        className={clsx(
                                                            "relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border hover:border-stora-500",
                                                            Boolean(item.id_bank.toString() === value?.id.toString())
                                                                ? "border-stora-500"
                                                                : "border-transparent"
                                                        )}
                                                    >
                                                        <p className="text-xs">{item.bank}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                onChange({
                                                                    id: item.id_bank,
                                                                    bank: item.bank.toString(),
                                                                    account: item.rekening,
                                                                    name: item.pemilik,
                                                                    payment_method: "tf"
                                                                })
                                                            }}
                                                        >&nbsp;</button>
                                                    </li>
                                                ) : null
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {(Array.isArray(payment.va) && payment.va.length > 0) && (
                                    <div className="py-2">
                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Virtual account</h3>
                                        <ul className="flex flex-wrap gap-3">
                                            {payment.va.map((item) => {
                                                const account = item.bank_code.replaceAll("_", " ").toString()
                                                return item.is_active ? (
                                                    <li
                                                        key={item.id_bank_va_xendit}
                                                        className={clsx(
                                                            "relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border hover:border-stora-500",
                                                            Boolean(item.id_bank_va_xendit.toString() === value?.id.toString())
                                                                ? "border-stora-500"
                                                                : "border-transparent"
                                                        )}
                                                    >
                                                        <p className="text-xs uppercase">Bank {account}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                onChange({
                                                                    id: item.id_bank_va_xendit,
                                                                    account: account,
                                                                    payment_method: "va",

                                                                })
                                                            }}
                                                        >&nbsp;</button>
                                                    </li>
                                                ) : null
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {(Array.isArray(payment.settings) && payment.settings.length > 0) && (
                                    <div className="py-2">
                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Lainnya</h3>
                                        <ul className="flex flex-col gap-3">
                                            {payment.settings.map((item) => {
                                                return item.status_qris ? (
                                                    <li
                                                        key={item.id_setting_xendit}
                                                        className={clsx(
                                                            "relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border hover:border-stora-500",
                                                            Boolean(item.id_setting_xendit.toString() === value?.id.toString())
                                                                ? "border-stora-500"
                                                                : "border-transparent"
                                                        )}
                                                    >
                                                        <p className="text-xs uppercase">{`QRIS`}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                onChange({
                                                                    id: item.id_setting_xendit,
                                                                    name: item.business_name,
                                                                    payment_method: "QRIS",
                                                                })
                                                            }}
                                                        >&nbsp;</button>
                                                    </li>
                                                ) : null
                                            })}

                                            {product.typeProduct === "fisik" && (
                                                <li
                                                    className={clsx(
                                                        "relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border hover:border-stora-500",
                                                        Boolean("COD" === value?.id.toString())
                                                            ? "border-stora-500"
                                                            : "border-transparent"
                                                    )}
                                                >
                                                    <p className="text-xs uppercase">{`COD (Cash On Delivery)`}</p>
                                                    <button
                                                        type="button"
                                                        className="absolute inset-0"
                                                        onClick={() => {
                                                            onChange({
                                                                id: "COD",
                                                                payment_method: "COD"
                                                            })
                                                        }}
                                                    >&nbsp;</button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="py-6 flex flex-col">
                                    <button
                                        type="button"
                                        className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                                        onClick={(event) => {
                                            setAlertOpen(false)
                                            if (value) {
                                                setIsOpenPayment(false)
                                                setCurrentPayment({
                                                    ...value,
                                                    id: value.id,
                                                    account: value.account,
                                                    payment_method: value.payment_method,
                                                })
                                            } else {
                                                window.clearTimeout(timerRef.current);
                                                timerRef.current = window.setTimeout(() => {
                                                    eventAlertRef.current = "Belum memilih metode pembayaran"
                                                    setAlertOpen(true)
                                                }, 100)
                                            }
                                            if (event) {
                                                if (typeof event.preventDefault === "function") {
                                                  event.preventDefault();
                                                }
                                                if (typeof event.stopPropagation === "function") {
                                                  event.stopPropagation();
                                                }
                                            }
                                        }}
                                    >Simpan</button>
                                </div>
                            </>
                        )
                    }}
                />
            </div>
        )
    }

    const totalStr = checkout.total.toString()
    totalStr.split(",")[0]

    console.log(errors)

    return (
        <>
            <div className="">
                <div className="px-8 sm:px-12">
                    <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Checkout</h3>
                </div>

                <form onSubmit={(event) => {
                    submitAction(event)
                    if (event) {
                        if (typeof event.preventDefault === 'function') {
                            event.preventDefault();
                        }
                        if (typeof event.stopPropagation === 'function') {
                            event.stopPropagation();
                        }
                    }
                }}>
                    <div className="px-8 sm:px-12 pb-[175px]">
                        {(Array.isArray(variations) && variations.length > 0) && (
                            <>
                                <Controller
                                    name="variasi"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({ field }) => {
                                        const { onChange, value } = field
                                        return (
                                            <>
                                                <h3 className="text-xs leading-none mb-2.5 block">Variasi</h3>
                                                <ul className="flex flex-wrap gap-4 mb-4">
                                                    {variations.map((item) => {
                                                        return (
                                                            <li
                                                                key={item.id}
                                                                className={clsx(
                                                                    "relative px-4 py-3 shadow rounded-lg border hover:border-stora-500",
                                                                    value === item.name ? "border-stora-500" : "border-transparent"
                                                                )}
                                                            >
                                                                <span className="text-xs">{item.name}</span>
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0"
                                                                    onClick={() => {
                                                                        onChange(item.name)
                                                                    }}
                                                                >&nbsp;</button>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </>
                                        )
                                    }}
                                />
                            </>
                        )}

                        {(Array.isArray(sizes) && sizes.length > 0) && (
                            <>
                                <Controller
                                    name="ukuran"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({ field }) => {
                                        const { onChange, value } = field
                                        return (
                                            <>
                                                <h3 className="text-xs leading-none mb-2.5 block">Ukuran</h3>
                                                <ul className="flex flex-wrap gap-4 mb-4">
                                                    {sizes.map((item) => {
                                                        const afterPrice = Number(item.price)
                                                        return (
                                                            <li
                                                                key={item.id}
                                                                className={clsx(
                                                                    "relative px-4 py-3 shadow rounded-lg border hover:border-stora-500",
                                                                    item.name === value ? "border-stora-500" : "border-transparent"
                                                                )}
                                                            >
                                                                <span className="text-xs">{item.name} {toIDR(afterPrice.toString())}</span>
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0"
                                                                    onClick={() => {
                                                                        onChange(item.name)
                                                                        // set_checkout
                                                                        setCheckout((prevState) => {
                                                                            const subTotal = multiplySubTotal(
                                                                                prevState.qty.toString(),
                                                                                afterPrice.toString()
                                                                            )
                                                                            const totalOngkir = sumTotal(
                                                                                subTotal.toString(),
                                                                                prevState.ongkir.toString()
                                                                            )
                                                                            const totalRand = sumTotal(
                                                                                totalOngkir.toString(),
                                                                                prevState.randCode.toString(),
                                                                            )
                                                                            const totalCoupon = subtractTotal(
                                                                                totalRand.toString(),
                                                                                (couponData?.discount || 0).toString()
                                                                            )
                                                                            return {
                                                                                ...prevState,
                                                                                subTotal,
                                                                                afterPrice,
                                                                                total: totalCoupon,
                                                                            }
                                                                        })
                                                                    }}
                                                                >&nbsp;</button>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </>
                                        )
                                    }}
                                />
                            </>
                        )}

                        <Controller
                            control={control}
                            name="jumlah"
                            rules={{
                                required: true,
                            }}
                            render={({ field }) => {
                                const { onChange, ref, ...rest } = field
                                return (
                                    <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                        <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="jumlah">
                                            Jumlah
                                        </label>
                                        <select
                                            {...rest}
                                            ref={ref}
                                            onChange={(event) => {
                                                const ongkir = address?.shipping?.price
                                                    ? Number(address.shipping.price)
                                                    : 0
                                                onChange(event)
                                                // set_checkout
                                                setCheckout((prevState) => {
                                                    const qty = Number(event.target.value)
                                                    const subtotal = multiplySubTotal(
                                                        qty.toString(),
                                                        prevState.afterPrice.toString()
                                                    )
                                                    const totalOngkir = sumTotal(
                                                        subtotal.toString(),
                                                        ongkir.toString()
                                                    )
                                                    const totalRand = sumTotal(
                                                        totalOngkir.toString(),
                                                        prevState.randCode.toString()
                                                    )
                                                    const totalCoupon = subtractTotal(
                                                        totalRand.toString(),
                                                        (couponData?.discount || 0).toString()
                                                    )
                                                    return {
                                                        ...prevState,
                                                        qty: qty,
                                                        subTotal: subtotal,
                                                        total: totalCoupon,
                                                    }
                                                })
                                            }}
                                            className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                        >
                                            {num()}
                                        </select>
                                    </fieldset>
                                )
                            }}
                        />

                        <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                            <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="nama_lengkap">
                                Nama Lengkap
                            </label>
                            <input
                                {...(register("nama_lengkap", { required: true }))}
                                className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                placeholder="Nama Lengkap"
                            />
                        </fieldset>

                        <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                            <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="nomor_whatsapp">
                                Nomor WhatsApp
                            </label>
                            <input
                                {...(register("nomor_whatsapp", { required: true }))}
                                className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                placeholder="Nomor WhatsApp"
                            />
                        </fieldset>

                        {(Array.isArray(fields) && fields.length > 0) && (
                            <ul>
                                {fields.map((item, index) => {
                                    return (
                                        <li key={item.id}>
                                            {Boolean(item.field === "input") && (
                                                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor={`custom_fields.${index}.value`}>
                                                        {item.label}
                                                    </label>
                                                    <input
                                                        {...(register(`custom_fields.${index}.value`, { required: item.required }))}
                                                        className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                                        placeholder={item.placeholder}
                                                    />
                                                </fieldset>
                                            )}

                                            {Boolean(item.field === "select") && (
                                                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor={`custom_fields.${index}.value`}>
                                                        {item.label}
                                                    </label>
                                                    <select
                                                        {...(register(`custom_fields.${index}.value`, { required: item.required }))}
                                                        className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                                    >
                                                        {item.options.map((item) => {
                                                            return (
                                                                <option value={item.value} key={item.id}>{item.value}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </fieldset>
                                            )}

                                            {Boolean(item.field === "textarea") && (
                                                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor={`custom_fields.${index}.value`}>
                                                        {item.label}
                                                    </label>
                                                    <textarea
                                                        {...(register(`custom_fields.${index}.value`, { required: item.required }))}
                                                        className="grow shrink-0 rounded-lg p-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[75px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                                        rows={3}
                                                        placeholder={item.placeholder}
                                                    ></textarea>
                                                </fieldset>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}

                        {Boolean(product.typeProduct === "fisik") && (
                            <>
                                <div className="w-full min-h-[75px] bg-slate-50 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs">Alamat Pengiriman:</div>
                                        <Dialog.Root
                                            open={isOpenAddress}
                                            onOpenChange={onOpenAddressChange}
                                        >
                                            <Dialog.Trigger asChild>
                                                {!!address ? (
                                                    <button className="inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                        <span className="text-[13px] leading-none text-stora-500 block">Ubah Alamat</span>
                                                        <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                    </button>
                                                ) : (
                                                    <button className="inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                        <span className="text-[13px] leading-none text-stora-500 block">Tambah alamat</span>
                                                        <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                    </button>
                                                )}
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                <Dialog.Content className="overflow-y-scroll z-40 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                    <div className="py-6 py-8">
                                                        <Dialog.Title className="m-0 text-sm font-medium">
                                                            Alamat Penerima
                                                        </Dialog.Title>
                                                        {/* Address */}
                                                        <IFormAddressArveoli
                                                            isFreeOngkir={product.isFreeOngkir}
                                                            userId={product.userId}
                                                            weight={product.weight}
                                                            onSelected={(val) => {
                                                                onOpenAddressChange(false)
                                                                const ongkir = val.shipping?.price
                                                                    ? Number(val.shipping.price)
                                                                    : 0
                                                                // set_address
                                                                setAddress(() => val)
                                                                // set_checkout
                                                                setCheckout((prevState) => {
                                                                    const totalOngkir = sumTotal(
                                                                        prevState.subTotal.toString(),
                                                                        (ongkir || 0).toString()
                                                                    )
                                                                    const totalRand = sumTotal(
                                                                        totalOngkir.toString(),
                                                                        prevState.randCode.toString()
                                                                    )
                                                                    const totalCoupon = subtractTotal(
                                                                        totalRand.toString(),
                                                                        (couponData?.discount || 0).toString()
                                                                    )
                                                                    return {
                                                                        ...prevState,
                                                                        ongkir,
                                                                        total: totalCoupon,
                                                                    }
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                    <Dialog.Close asChild>
                                                        <button
                                                            className="text-stora-800 hover:bg-stora-200 focus:shadow-stora-200 absolute top-8 right-8 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                            aria-label="Close"
                                                        >
                                                            <Cross2Icon className="w-5 h-5" />
                                                        </button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Portal>
                                        </Dialog.Root>
                                    </div>

                                    {!!address && (
                                        <div className="my-3">
                                            <p className="text-xs">
                                                {`${address.address ? `${address.address},` : ""} 
                                                    ${address.urban_village.length > 1 ? `${address.urban_village},` : ""} 
                                                    ${address.sub_district.length > 1 ? `${address.sub_district},` : ""}
                                                    ${address.regency.length > 1 ? `${address.regency},` : ""}
                                                    ${address.province ? address.province : ""}
                                                `}
                                            </p>
                                            {address.zip_code ? (
                                                <p className="text-xs">
                                                    {`Kode Pos: ${address.zip_code}`}
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    {!!address?.shipping && (
                                        <>
                                            <div className="flex items-center justify-between my-2">
                                                <div className="text-xs">Informasi Pengiriman:</div>
                                                <Dialog.Root
                                                    open={isOpenShipping}
                                                    onOpenChange={onOpenShippingChange}
                                                >
                                                    <Dialog.Trigger asChild>
                                                        <button className="inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                            <span className="text-[13px] leading-none text-stora-500 block">Ubah pengiriman</span>
                                                            <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                        </button>
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                        <Dialog.Content className="z-40 overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                            <div className="py-6 px-8">
                                                                <Dialog.Title className="text-mauve12 m-0 text-sm font-medium">
                                                                    Pengiriman
                                                                </Dialog.Title>
                                                                {/* Form shipping data */}
                                                                {!!shippingArveoli && (
                                                                    <>
                                                                        {shippingArveoliMap()}
                                                                    </>
                                                                )}
                                                            </div>

                                                            <Dialog.Close asChild>
                                                                <button
                                                                    className="hover:bg-stora-200 focus:shadow-stora-300 absolute top-8 right-8 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                                    aria-label="Close"
                                                                >
                                                                    <Cross2Icon className="w-5 h-5" />
                                                                </button>
                                                            </Dialog.Close>
                                                        </Dialog.Content>
                                                    </Dialog.Portal>
                                                </Dialog.Root>
                                            </div>

                                            <div>
                                                <p className="text-xs">
                                                    <span className="uppercase">{address.shipping?.s_name}</span>{", "}
                                                    {address.shipping.service_name}{" "}
                                                    {address.shipping.price
                                                        ? toIDR(address.shipping.price.toString())
                                                        : ""}
                                                </p>
                                                {!!address.shipping.etd && (
                                                    <p className="text-xs italic">{address.shipping.etd}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Kupon  */}
                                <div className="flex justify-between my-4">
                                    <div>
                                        <label className="text-[13px]">
                                            Kupon
                                        </label>
                                    </div>
                                    <div>
                                        <Dialog.Root
                                            open={isOpenCoupon}
                                            onOpenChange={setIsOpenCoupon}
                                        >
                                            <Dialog.Trigger asChild>
                                                <button className="text-violet11 inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                    <span className="text-[13px] leading-none text-stora-500 block">Pilih</span>
                                                    <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                </button>
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                <Dialog.Content className="z-40 overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                    <div className="py-8">
                                                        <Dialog.Title className="text-mauve12 m-0 text-sm font-medium">
                                                            Kupon Stora
                                                        </Dialog.Title>
                                                        {/* Form kupon stora */}
                                                        <IFormCoupon
                                                            product_id={product.productId}
                                                            permalink={permalink}
                                                            price={checkout.afterPrice}
                                                            applyCoupon={(data) => {
                                                                const discount = data.discount || 0
                                                                // set_coupon
                                                                setCouponData({
                                                                    discount,
                                                                    coupon: data.coupon,
                                                                })
                                                                // set_checkout
                                                                setCheckout((prevState) => {
                                                                    const totalOngkir = sumTotal(
                                                                        prevState.subTotal.toString(),
                                                                        prevState.ongkir.toString()
                                                                    )
                                                                    const totalRand = sumTotal(
                                                                        totalOngkir.toString(),
                                                                        prevState.randCode.toString()
                                                                    )
                                                                    const totalCoupon = subtractTotal(
                                                                        totalRand.toString(),
                                                                        discount.toString(),
                                                                    )
                                                                    return {
                                                                        ...prevState,
                                                                        total: totalCoupon,
                                                                    }
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                    <Dialog.Close asChild>
                                                        <button
                                                            className="text-stora-700 hover:bg-stora-100 focus:shadow-stora-100 absolute top-8 right-8 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                            aria-label="Close"
                                                        >
                                                            <Cross2Icon className="w-5 h-5" />
                                                        </button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Portal>
                                        </Dialog.Root>
                                    </div>
                                </div>

                                {!!couponData && (
                                    <div className="mb-3">
                                        <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                                            <div className="flex justify-between">
                                                <span className="text-xs">
                                                    {couponData.coupon}
                                                </span>
                                                <span className="text-xs">{toIDR(couponData.discount.toString())}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pembayaran */}
                                <div className="flex justify-between my-4">
                                    <div>
                                        <label className="text-[13px]">
                                            Metode pembayaran
                                        </label>
                                    </div>
                                    <div>
                                        <Dialog.Root
                                            open={isOpenPayment}
                                            onOpenChange={setIsOpenPayment}
                                        >
                                            <Dialog.Trigger asChild>
                                                <button className="text-violet11 inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                    <span className="text-[13px] leading-none text-stora-500 block">Tampilkan semua</span>
                                                    <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                </button>
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                <Dialog.Content className="z-40 overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                    <div className="py-8">
                                                        <Dialog.Title className="text-mauve12 m-0 text-sm font-medium">
                                                            Metode pembayaran
                                                        </Dialog.Title>
                                                        {/* Form shipping data */}
                                                        {paymentComponent()}
                                                    </div>
                                                    <Dialog.Close asChild>
                                                        <button
                                                            className="text-stora-700 hover:bg-stora-100 focus:shadow-stora-100 absolute top-8 right-8 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                            aria-label="Close"
                                                        >
                                                            <Cross2Icon className="w-5 h-5" />
                                                        </button>
                                                    </Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Portal>
                                        </Dialog.Root>
                                    </div>
                                </div>

                                {!!currentPayment && (
                                    <div className="mb-3">
                                        {getPaymentMethod(currentPayment)}
                                    </div>
                                )}
                            </>
                        )}

                        {Boolean(product.typeProduct === "digital") && (
                            <div>
                                typeProduct digital
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-lg">
                            <div className="pt-4 px-4 pb-2 border-b">
                                <h3 className="text-gray-800 text-[13px] font-medium tracking-wide">Rincian pembayaran:</h3>
                            </div>
                            <div className="px-4 py-2">
                                <div className="flex flex-col mb-2 rounded-lg shadow-sm px-3 py-2">
                                    <div className="flex mb-1">
                                        <p>
                                            <span className="text-gray-800 text-[12px] font-normal tracking-wide">
                                                {product.productName}
                                            </span>{" "}
                                            {(watch("variasi") || watch("ukuran")) && (
                                                <span className="text-[12px]">
                                                    {`(${(watch("variasi") || "")} ${(watch("ukuran") || "")})`}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-800 text-[12px] font-normal tracking-wide">
                                            {toIDR(checkout.afterPrice.toString())}
                                        </span>
                                        <span className="text-gray-800 text-[12px] font-normal tracking-wide">
                                            x{checkout.qty}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    {codeUnique && (
                                        <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                            <span className="text-gray-800 text-[13px] font-medium tracking-wide">Kode Unik</span>
                                            <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                                {getLastThreeWords(checkout.total.toString())}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                        <span className="text-gray-800 text-[13px] font-medium tracking-wide">Subtotal</span>
                                        <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                            {toIDR(checkout.subTotal.toString())}
                                        </span>
                                    </div>
                                    {!product.isFreeOngkir && (
                                        <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                            <span className="text-gray-800 text-[13px] font-medium tracking-wide">Pengiriman</span>
                                            <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                                {!!address?.shipping
                                                    ? (
                                                        <>
                                                            {toIDR(address.shipping.price.toString())}
                                                        </>
                                                    ) : toIDR("0")}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                        <span className="text-gray-800 text-[13px] font-medium tracking-wide">Kupon Stora</span>
                                        <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                            {couponData
                                                ? toIDR(couponData.discount.toString())
                                                : toIDR("0")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                        <span className="text-gray-800 text-[13px] font-medium tracking-wide">Total</span>
                                        <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                            {toIDR(checkout.total.toString())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="fixed bottom-0 z-40 inset-x-0 pb-8 sm:pb-6">
                        <div className="w-full max-w-lg mx-auto px-3">
                            <div className="h-12 flex items-center justify-between bg-stora-500 rounded-lg px-3 shadow">
                                <span className="text-sm tracking-wide text-white">
                                    {toIDR(checkout.total.toString())}
                                </span>
                                <button className="inline-flex items-center justify-center rounded-lg px-[15px] text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default">
                                    {product.textBtnOrder}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Toast.Provider swipeDirection="right">
                <Toast.Root
                    className="bg-white rounded-lg shadow shadow-red-500 p-3 flex justify-between items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
                    open={openAlert}
                    onOpenChange={setAlertOpen}
                >
                    <Toast.Description asChild>
                        {eventAlertRef.current && (
                            <span className="[grid-area:_description] text-slate11 text-xs leading-[1.3]">
                                {eventAlertRef.current.toString()}
                            </span>
                        )}
                    </Toast.Description>
                    <Toast.Action className="[grid-area:_action]" asChild altText="Oke">
                        <button className="inline-flex items-center justify-center rounded font-normal text-xs px-[10px] leading-[25px] h-[25px] shadow-[inset_0_0_0_1px] shadow-gray-300 hover:shadow-[inset_0_0_0_1px] hover:shadow-gray-400 focus:shadow-[0_0_0_2px] focus:shadow-gray-500">
                            OKE
                        </button>
                    </Toast.Action>
                </Toast.Root>
                <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-20 flex flex-col px-3 gap-[10px] w-full max-w-lg m-0 list-none z-[2147483647] outline-none" />
            </Toast.Provider>
        </>
    )
}