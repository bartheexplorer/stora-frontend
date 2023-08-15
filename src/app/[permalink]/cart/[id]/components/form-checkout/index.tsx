"use client"

import { useForm, Controller } from "react-hook-form"
import { type IFormValueCheckout, IFormValueCheckoutSchema } from "./form-checkout-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useRef, useState } from "react"
import * as Toast from "@radix-ui/react-toast"
import { toIDR } from "@/utils/to-idr"
import { useCreateOrderCart } from "@/hooks/cart"
import * as Dialog from "@radix-ui/react-dialog"
import { CaretRightIcon, Cross2Icon } from "@radix-ui/react-icons"
import { validateAndConvertToString } from "@/utils/to-string-converter"
import { multiplySubTotal, subtractTotal, sumTotal } from "@/utils/add-decimal"
import clsx from "clsx"
import BankLogo from "./bank-logo"
import IFormAddressArveoli from "./form-address-arveoli"
import { OrderContext } from "@/context/order"
import { getLastThreeWords } from "@/utils/get-unik-code"
import { getRandomThreeDigitNumber } from "@/utils/get-rand-number"
import { useRouter } from "next/navigation"
import ILoading from "../loading"

const RAND_CODE = getRandomThreeDigitNumber()

interface IFormCheckoutProps {
    cartId: string
    user: {
        name?: string | null
        no_hp?: string | null
        user_id?: string | null
        member_id?: string | null
    }
    permalink: string
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
    product: {
        isFreeOngkir: boolean
        isFree: boolean
        weight: number
        total: number
        discount: number
    }
    codeUnique: boolean
}

type AddressType = {
    province: string
    regency: string
    id_mapping: string
    sub_district: string
    urban_village: string
    zip_code: string
    address: string
}

type ShippingType = {
    service_code: string
    service_name: string
    price: number
    etd: string
    discount_price: number
    cashless_discount_price: number
    s_name: string
}

export default function IFormCheckout({
    permalink,
    payment,
    user,
    product,
    cartId,
    codeUnique,
}: IFormCheckoutProps) {
    const router = useRouter()
    const { shippingArveoli } = useContext(OrderContext)
    const {
        sendRequest: createOrder,
        isLoading: loadingCreateOrder,
    } = useCreateOrderCart()
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
    const cunik = codeUnique ? RAND_CODE : 0
    const totalUniqueCode = Math.round(Number(product.total + cunik))

    const [checkout, setCheckout] = useState<{
        subTotal: number
        total: number
        randCode: number
        ongkir: number
    }>({
        total: totalUniqueCode,
        subTotal: product.total,
        randCode: cunik,
        ongkir: 0,
    })
    const [address, setAddress] = useState<AddressType | null>(null)
    const [currentShipping, setCurrentShipping] = useState<ShippingType | null>(null)
    const [selectedShipping, setSelectedShipping] = useState<ShippingType | null>(null)
    const [openAlert, setAlertOpen] = useState(false)
    const eventAlertRef = useRef<string | null>(null)
    const timerRef = useRef(0)
    const {
        register,
        handleSubmit,
        control,
    } = useForm<IFormValueCheckout>({
        resolver: zodResolver(IFormValueCheckoutSchema),
    })

    const onHandleSubmit = handleSubmit(async (data) => {
        setAlertOpen(false)
        const body = {
            ...data,
            permalink,
            user,
            product,
            cartId,
            currentPayment,
            currentShipping,
            address,
            checkout,
        }
        const result = await createOrder(body)
        console.log("!!Result", !!result)
        console.log("Result", result)
        if (!result?.orderId) return
        router.push(`/${permalink}/sucess?id=${result?.orderId}&m=1&_=${(Math.floor(Math.random() * 900) + 100).toString()}`)
    })

    const paymentComponent = () => {
        return (
            <div className="">
                <Controller
                    name="payment"
                    control={control}
                    render={({ field }) => {
                        const { onChange, value } = field

                        const isQris = (Array.isArray(payment.settings) && payment.settings.length > 0)
                            ? payment.settings[0].status_qris
                            : false

                        const isVa = (Array.isArray(payment.settings) && payment.settings.length > 0)
                            ? payment.settings[0].status_va
                            : false

                        return (
                            <>
                                {(Array.isArray(payment.transfer) && payment.transfer.length > 0) && (
                                    <div className="py-2">
                                        <div className="bg-slate-300 py-2 px-8">
                                            <h3 className="py-2 text-xs font-semibold tracking-wide">Transfer</h3>
                                        </div>
                                        <ul className="flex flex-col">
                                            {payment.transfer.map((item) => {
                                                const classActive = item.id_bank === value?.id
                                                return item.is_active ? (
                                                    <li
                                                        key={item.id_bank}
                                                        className={clsx(
                                                            "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                            classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                <BankLogo id={item.id_bank.toString()} />
                                                            </div>
                                                            <p className="text-xs text-gray-800 font-semibold">{item.bank}</p>
                                                        </div>
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

                                {isVa && (
                                    <>
                                        {(Array.isArray(payment.va) && payment.va.length > 0) && (
                                            <div className="py-2">
                                                <div className="bg-slate-300 py-2 px-8">
                                                    <h3 className="py-2 text-xs font-semibold tracking-wide">Virtual account</h3>
                                                </div>
                                                <ul className="flex flex-col">
                                                    {payment.va.map((item) => {
                                                        const account = item.bank_code.replaceAll("_", " ").toString()
                                                        const classActive = item.id_bank_va_xendit === value?.id
                                                        return item.is_active ? (
                                                            <li
                                                                key={item.id_bank_va_xendit}
                                                                className={clsx(
                                                                    "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                    classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-10 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                        <BankLogo id={item.id_bank_va_xendit.toString()} />
                                                                    </div>
                                                                    <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                        {`Bank ${account}`}
                                                                    </p>
                                                                </div>
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
                                    </>
                                )}

                                <div className="py-2">
                                    <div className="bg-slate-300 py-2 px-8">
                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Lainnya {isQris.valueOf()}</h3>
                                    </div>

                                    {isQris && (
                                        <>
                                            {(Array.isArray(payment.settings) && payment.settings.length > 0) && (
                                                <ul className="flex flex-col">
                                                    {payment.settings.map((item) => {
                                                        const classActive = item.id_setting_xendit === value?.id
                                                        return item.status_qris ? (
                                                            <li
                                                                key={item.id_setting_xendit}
                                                                className={clsx(
                                                                    "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                    classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-10 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                        <BankLogo id={item.id_setting_xendit.toString()}/>
                                                                    </div>
                                                                    <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                        {`QRIS`}
                                                                    </p>
                                                                </div>
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
                                                </ul>
                                            )}
                                        </>
                                    )}

                                    <ul className="flex flex-col gap-3">
                                        <li
                                            className={clsx(
                                                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <BankLogo id="cod" />
                                                </div>
                                                <p className="text-xs text-gray-800 font-semibold uppercase">
                                                    {`COD (Cash On Delivery)`}
                                                </p>
                                            </div>
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
                                    </ul>
                                </div>

                                <div className="px-12 py-6 flex flex-col">
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

    const selectPaymentMethod = () => {
        return (
            <>
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
                                <Dialog.Content className="z-40 overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white shadow focus:outline-none">
                                    <div className="py-20">
                                        <Dialog.Title className="m-0 text-sm font-medium px-8 py-2">
                                            Metode pembayaran
                                        </Dialog.Title>
                                        {/* Form shipping data */}
                                        {paymentComponent()}
                                    </div>
                                    <Dialog.Close asChild>
                                        <button
                                            className="text-stora-700 hover:bg-stora-100 focus:shadow-stora-100 absolute top-12 right-12 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
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
        )
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

        const serviceCode = selectedShipping
            ? selectedShipping.service_code.toString()
            : null
        console.log("serviceCode", serviceCode)

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
                                                                "relative p-2 bg-gray-100 rounded-lg shadow border-2 hover:shadow-lg",
                                                                item.service_code === serviceCode
                                                                    ? "border-stora-500 bg-slate-200"
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
                                                                    const ongkir = !Number.isNaN(parseInt(item.price.toString()))
                                                                        ? Number(item.price)
                                                                        : 0
                                                                    // set_selected_address
                                                                    setSelectedShipping((prevState) => {
                                                                        return {
                                                                            ...(prevState ? prevState : {}),
                                                                            s_name,
                                                                            service_code: item.service_code.toString(),
                                                                            service_name: item.service_name,
                                                                            price: ongkir,
                                                                            etd: item.etd
                                                                                ? item.etd
                                                                                : "",
                                                                            discount_price: !Number.isNaN(parseInt(item.discount_price.toString()))
                                                                                ? Number(item.discount_price)
                                                                                : 0,
                                                                            cashless_discount_price: !Number.isNaN(parseInt(item.cashless_discount_price.toString()))
                                                                                ? Number(item.cashless_discount_price)
                                                                                : 0,
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

                    <div className="px-12 py-6 flex flex-col">
                        <button
                            type="button"
                            className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                            onClick={() => {
                                if (selectedShipping) {
                                    const ongkir = !Number.isNaN(parseInt(selectedShipping.price.toString()))
                                        ? Number(selectedShipping.price)
                                        : 0
                                    setIsOpenShipping(false)
                                    setCurrentShipping((prevState) => ({
                                        ...prevState,
                                        ...selectedShipping,
                                    }))
                                    // set_checkout
                                    setCheckout((prevState) => {
                                        const totalOngkir = sumTotal(
                                            prevState.subTotal.toString(),
                                            ongkir.toString()
                                        )
                                        const totalRand = sumTotal(
                                            totalOngkir.toString(),
                                            prevState.randCode.toString(),
                                        )
                                        return {
                                            ...prevState,
                                            ongkir,
                                            total: totalRand,
                                        }
                                    })
                                }
                            }}
                        >Simpan</button>
                    </div>
                </>
            ) : null
    }

    return (
        <>
            <div className="px-12 pt-4 pb-36">
                <form onSubmit={(event) => {
                    onHandleSubmit(event)
                    if (event) {
                        if (typeof event.preventDefault === "function") {
                            event.preventDefault();
                        }
                        if (typeof event.stopPropagation === "function") {
                            event.stopPropagation();
                        }
                    }
                }}>
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

                    {/* Addresses */}
                    <div className="w-full min-h-[75px] bg-slate-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs">Alamat Pengiriman:</div>
                            <Dialog.Root
                                open={isOpenAddress}
                                onOpenChange={setIsOpenAddress}
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
                                        <div className="py-20">
                                            <Dialog.Title className="text-sm font-medium mb-6">
                                                Alamat Penerima
                                            </Dialog.Title>
                                            {/* Address */}
                                            <IFormAddressArveoli
                                                isFreeOngkir={product.isFreeOngkir}
                                                userId={user.user_id ? user.user_id.toString() : "01"}
                                                weight={product.weight.toString()}
                                                onSelected={(val) => {
                                                    setIsOpenAddress(false)
                                                    let ongkir = 0
                                                    if (val.shipping) {
                                                        const price = !Number.isNaN(parseInt(val.shipping.price.toString()))
                                                            ? Number(val.shipping.price)
                                                            : 0
                                                        ongkir = price
                                                        const shipping: ShippingType = {
                                                            service_code: val.shipping.service_code,
                                                            service_name: val.shipping.service_name,
                                                            price: val.shipping.price,
                                                            etd: val.shipping.etd
                                                                ? val.shipping.etd
                                                                : "",
                                                            discount_price: val.shipping.discount_price,
                                                            cashless_discount_price: val.shipping.cashless_discount_price,
                                                            s_name: val.shipping.s_name
                                                                ? val.shipping.s_name
                                                                : "",
                                                        }
                                                        setCurrentShipping((prevState) => {
                                                            return {
                                                                ...(prevState ? prevState : {}),
                                                                ...shipping,
                                                            }
                                                        })
                                                    }
                                                    // set_address
                                                    setAddress((prevState) => {
                                                        return {
                                                            ...(prevState ? prevState : {}),
                                                            province: val.province,
                                                            regency: val.regency,
                                                            id_mapping: val.id_mapping,
                                                            sub_district: val.sub_district,
                                                            urban_village: val.urban_village,
                                                            zip_code: val.zip_code,
                                                            address: val.address,
                                                        }
                                                    })
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

                                                        return {
                                                            ...prevState,
                                                            ongkir,
                                                            total: totalRand,
                                                        }
                                                    })
                                                }}
                                            />
                                        </div>
                                        <Dialog.Close asChild>
                                            <button
                                                className="text-stora-800 hover:bg-stora-200 focus:shadow-stora-200 absolute top-12 right-12 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
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
                                    {validateAndConvertToString([
                                        address.address,
                                        address.urban_village,
                                        address.sub_district,
                                        address.regency,
                                        address.province
                                    ])}
                                </p>
                                {address.zip_code ? (
                                    <p className="text-xs">
                                        {validateAndConvertToString([
                                            `Kode Pos: ${address.zip_code}`
                                        ])}
                                    </p>
                                ) : null}
                            </div>
                        )}

                        {!!currentShipping && (
                            <>
                                <div className="flex items-center justify-between my-2">
                                    <div className="text-xs">Informasi Pengiriman:</div>
                                    <Dialog.Root
                                        open={isOpenShipping}
                                        onOpenChange={setIsOpenShipping}
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
                                                <div className="py-20">
                                                    <Dialog.Title className="mb-6 text-sm font-medium">
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
                                                        className="hover:bg-stora-200 focus:shadow-stora-300 absolute top-12 right-12 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
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
                                        <span className="uppercase">{currentShipping.s_name}</span>{", "}
                                        {currentShipping.service_name}{" "}
                                        {currentShipping.price
                                            ? toIDR(currentShipping.price.toString())
                                            : toIDR("0")}
                                    </p>
                                    {!!currentShipping.etd && (
                                        <p className="text-xs italic">{currentShipping.etd}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {selectPaymentMethod()}

                    <div>
                        <div className="bg-slate-50 rounded-lg">
                            <div className="pt-4 px-4 pb-2 border-b">
                                <h3 className="text-gray-800 text-[13px] font-medium tracking-wide">Rincian pembayaran:</h3>
                            </div>
                            <div className="px-4 py-2">

                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                        <span className="text-gray-800 text-[13px] font-medium tracking-wide">Kode Unik</span>
                                        <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                            {getLastThreeWords(checkout.total.toString())}
                                        </span>
                                    </div>
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
                                                {!!currentShipping
                                                    ? toIDR(currentShipping.price.toString())
                                                    : toIDR("0")}
                                            </span>
                                        </div>
                                    )}
                                    
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
                        <div className="w-full max-w-lg mx-auto px-8">
                            <div className="h-12 flex items-center justify-between bg-stora-500 rounded-lg px-3 shadow">
                                <span className="text-sm tracking-wide text-white">
                                    {toIDR(checkout.total.toString())}
                                </span>
                                <div className="flex gap-3">

                                    <button
                                        type="submit"
                                        disabled={loadingCreateOrder}
                                        className="inline-flex items-center justify-center rounded-lg px-4 text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default"
                                    >
                                        Selesaikan pesanan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {loadingCreateOrder && (
                <div className="z-50 overflow-hidden w-full h-screen fixed inset-0 bg-slate-300/25 flex flex-col items-center justify-center">
                    <ILoading />
                </div>
            )}

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
                <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-24 sm:bottom-20 flex flex-col px-8 gap-[10px] w-full max-w-lg m-0 list-none z-[2147483647] outline-none" />
            </Toast.Provider>
        </>
    )
}