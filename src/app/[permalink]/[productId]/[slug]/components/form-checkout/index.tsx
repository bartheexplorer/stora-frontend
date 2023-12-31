"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { IFormValueCheckoutSchema, type IFormValueCheckout } from "./form-checkout-type"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Dialog from "@radix-ui/react-dialog"
import { CaretRightIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons"
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
import { useCreateOrder } from "@/hooks/order"
import ILoading from "../loading"
import { useCreateCart } from "@/hooks/cart"
import { useRouter } from "next/navigation"
import { validateAndConvertToString } from "@/utils/to-string-converter"
import BankLogo from "./bank-logo"
import * as RadioGroup from "@radix-ui/react-radio-group"
import Link from "next/link"
import { useKurir } from "./use-kurir"

const RAND_CODE = getRandomThreeDigitNumber()

interface IFormCheckoutProps {
    cartId?: string
    isCart: boolean
    user: {
        name?: string | null
        no_hp?: string | null
        user_id?: string | null
        member_id?: string | null
    }
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
        productImg: string
        productName: string
        price: number
        userId: string
        isFree: boolean
        isFreeOngkir: boolean
        weight: string
        link: string
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
    firstPickup: {
        kd_setting_pickup_arveoli: string
        id_user: string
        expedisi: string
        label: string
        nama_tim_gudang: string
        no_hp_tim_gudang: string
        origin_code: string
        branch_code: string
        kota_pickup: string
        kecamatan_pickup: string
        kode_pos: string
        alamat_lengkap: string
    }
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
    variations,
    sizes,
    product,
    payment,
    codeUnique,
    user,
    isCart,
    cartId,
    ...props
}: IFormCheckoutProps) {
    const router = useRouter()
    const {
        sendRequest: createCart,
    } = useCreateCart()
    const {
        sendRequest: createOrder,
        isLoading: loadingCreateOrder,
    } = useCreateOrder()
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

    const {
        data: kurir,
    } = useKurir(product.userId)

    const _kurir = kurir?.data

    let total = 0
    let ranCodeUnique = 0
    const cunik = codeUnique ? RAND_CODE : 0
    const totalUniqueCode = Math.round(Number(product.price + cunik))
    const price = product.price > 0
    if (product.typeProduct === "fisik") {
        if (!product.isFree) {
            ranCodeUnique = cunik
            total = price ? totalUniqueCode : 0
        }
        if (!product.isFreeOngkir) {
            ranCodeUnique = cunik
            total = price ? totalUniqueCode : 0
        }
    } else {
        if (!product.isFree) {
            total = price ? totalUniqueCode : 0
            ranCodeUnique = cunik
        }
    }

    const [checkout, setCheckout] = useState<{
        price: number
        afterPrice: number
        subTotal: number
        total: number
        qty: number
        randCode: number
        ongkir: number
    }>({
        total,
        subTotal: product.price,
        price: product.price,
        afterPrice: product.price,
        qty: 1,
        randCode: ranCodeUnique,
        ongkir: 0,
    })
    const [address, setAddress] = useState<AddressType | null>(null)
    const [currentShipping, setCurrentShipping] = useState<ShippingType | null>(null)
    const [selectedShipping, setSelectedShipping] = useState<ShippingType | null>(null)
    const [openAlert, setAlertOpen] = useState(false)
    const eventAlertRef = useRef<string | null>(null)
    const [errorPengiriman, setErrorPengiriman] = useState<string | null>(null)
    const timerRef = useRef(0)
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        getValues,
        formState: { errors },
    } = useForm<IFormValueCheckout>({
        resolver: zodResolver(IFormValueCheckoutSchema),
        defaultValues: {
            custom_fields: product.customFields.map((item) => ({
                id: item.id,
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

    const shoppingCarts = async () => {
        const variation = getValues("variasi")
        const size = getValues("ukuran")
        const qty = getValues("jumlah")

        setAlertOpen(false)
        if ((Array.isArray(variations) && variations.length > 0)) {
            if (!variation || typeof variation !== "string") {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum memilih variasi"
                    setAlertOpen(true)
                }, 100)
                return
            }
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            if (!size || typeof size !== "string") {
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum memilih ukuran"
                    setAlertOpen(true)
                }, 100)
                return
            }
        }

        const ck = subtractTotal(
            checkout.subTotal.toString(),
            (couponData?.discount || 0).toString()
        )

        const ckUniqueCode = sumTotal(
            ck.toString(),
            checkout.afterPrice > 0
                ? checkout.randCode.toString()
                : "0"
        )

        const params = {
            variation,
            size,
            cartId,
            couponData,
            checkout: {
                ...checkout,
                total: ckUniqueCode,
            },
            product,
            qty,
        }
        const result = await createCart(params)
        if (!result?.data) {
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                eventAlertRef.current = "Gagal menambahkan produk"
                setAlertOpen(true)
            }, 100)
            return
        }
        reset()
        router.push(`/${permalink}/cart?id=${(Math.floor(Math.random() * 900) + 100).toString()}`)
    }

    const submitAction = handleSubmit(async (data) => {
        setErrorPengiriman(null)
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

        let alamat: string = ""
        if (product.typeProduct === "fisik") {
            if (!address) {
                setErrorPengiriman("Belum mengisi alamat")
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    eventAlertRef.current = "Belum mengisi alamat"
                    setAlertOpen(true)
                }, 100)
                return
            }

            alamat = validateAndConvertToString([
                address.address,
                address.urban_village,
                address.sub_district,
                address.regency,
                address.province,
                address.zip_code ? `Kode Pos: ${address.zip_code}` : "",
            ])

            if (!product.isFree) {
                if (!currentShipping) {
                    setErrorPengiriman("Belum memilih ongkos kirim")
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih ongkos kirim"
                        setAlertOpen(true)
                    }, 100)
                    return
                }

                if (!currentPayment) {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }

                if (!currentPayment.id && typeof currentPayment.id !== "string") {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }
            }

            if (!product.isFreeOngkir) {
                if (!currentPayment) {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }

                if (!currentShipping) {
                    setErrorPengiriman("Belum memilih ongkos kirim")
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih ongkos kirim"
                        setAlertOpen(true)
                    }, 100)
                    return
                }

                if (!currentPayment.id && typeof currentPayment.id !== "string") {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }
            }
        } else {
            if (!product.isFree) {
                if (!currentPayment) {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }

                if (!currentPayment.id && typeof currentPayment.id !== "string") {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        eventAlertRef.current = "Belum memilih metode pembayaran"
                        setAlertOpen(true)
                    }, 100)
                    return
                }
            }
        }

        try {
            const result = await createOrder({
                ...data,
                checkout,
                address,
                currentPayment,
                couponData,
                currentShipping,
                permalink,
                user,
                alamat,
                is_free: product.isFree,
                is_free_ongkir: product.isFreeOngkir,
                weight: product.weight,
                nama_produk: product.productName,
                product_id: product.productId,
                type_product: product.typeProduct,
                product_img: product.productImg,
            })
            if (!result?.data?.orderId) throw new Error("Error")

            reset()
            router.push(`/${permalink}/sucess?id=${result.data.orderId}`)
        } catch (error) {
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                eventAlertRef.current = "Pesanan tidak dapat diproses"
                setAlertOpen(true)
            }, 100)
        }
    })

    const onOpenAddressChange = (value: boolean) => {
        setIsOpenAddress(value)
    }

    const onOpenShippingChange = (value: boolean) => {
        setIsOpenShipping(value)
    }

    // const num = (length: number = 50) => {
    //     const array: number[] = []
    //     for (let index = 1; index <= length; index++) {
    //         array.push(index);
    //     }

    //     return array.map((item) => (<option key={item} value={item}>{item}</option>))
    // }

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
                                                                            service_code: item.service_code?.toString() || "",
                                                                            service_name: item.service_name || "",
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

                        {!!_kurir && (
                            <>
                                <li className="mt-5">
                                    <h4 className="uppercase text-xs font-semibold tracking-wide mb-2">Kurir Lokal</h4>
                                    <ul className="flex flex-wrap gap-3">
                                        <li
                                            className={clsx(
                                                "relative py-2 px-3 bg-gray-100 rounded-lg shadow border-2 hover:shadow-lg",
                                                _kurir.key === serviceCode
                                                    ? "border-stora-500 bg-slate-200"
                                                    : "border-transparent"
                                            )}
                                        >
                                            <p className="text-xs text-gray-800 mb-1.5">Lokal</p>
                                            {!!_kurir.ongkir && (
                                                <p className="text-xs text-gray-800 mb-1.5">{toIDR(_kurir.ongkir.toString())}</p>
                                            )}
                                            {/* <p className="text-xs text-gray-800">Lokal</p> */}
                                            <button
                                                type="button"
                                                className="absolute inset-0"
                                                onClick={(event) => {
                                                    const ongkir = !Number.isNaN(parseInt(_kurir.ongkir.toString()))
                                                        ? Number(_kurir.ongkir)
                                                        : 0
                                                    // set_selected_address
                                                    setSelectedShipping((prevState) => {
                                                        return {
                                                            ...(prevState ? prevState : {}),
                                                            s_name: _kurir.key,
                                                            service_code: _kurir.key,
                                                            service_name: _kurir.key,
                                                            price: ongkir,
                                                            etd: "",
                                                            discount_price: !Number.isNaN(parseInt(_kurir.ongkir.toString()))
                                                                ? Number(_kurir.ongkir)
                                                                : 0,
                                                            cashless_discount_price: !Number.isNaN(parseInt(_kurir.ongkir.toString()))
                                                                ? Number(_kurir.ongkir)
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
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="px-12 py-6 flex flex-col">
                        <button
                            type="button"
                            className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                            onClick={() => {
                                if (selectedShipping) {
                                    const ongkir = selectedShipping.price
                                    setIsOpenShipping(false)
                                    setCurrentShipping((prevState) => ({
                                        ...prevState,
                                        ...selectedShipping,
                                    }))
                                    // set_checkout
                                    setCheckout((prevState) => {
                                        const subTotal = multiplySubTotal(
                                            prevState.qty.toString(),
                                            prevState.afterPrice.toString()
                                        )
                                        const totalOngkir = sumTotal(
                                            subTotal.toString(),
                                            ongkir.toString()
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
                                            ongkir,
                                            total: totalCoupon,
                                        }
                                    })
                                }
                            }}
                        >Simpan</button>
                    </div>
                </>
            ) : null
    }

    // select payment
    const paymentComponent = () => {
        return (
            <div className="">
                <Controller
                    name="payment"
                    control={control}
                    render={({ field }) => {
                        const { onChange: _onChange, value } = field

                        const onChange = (vl: any) => {
                            _onChange(vl)
                            setCurrentPayment({
                                ...vl,
                                id: vl.id,
                                account: vl.account,
                                payment_method: vl.payment_method,
                            })
                        }

                        const isQris = (Array.isArray(payment.settings) && payment.settings.length > 0)
                            ? payment.settings[0].status_qris
                            : false

                        const isVa = (Array.isArray(payment.settings) && payment.settings.length > 0)
                            ? payment.settings[0].status_va
                            : false

                        return (
                            <>
                                <RadioGroup.Root
                                    className="flex flex-col gap-2.5"
                                    aria-label="View density"
                                    onValueChange={(value) => {
                                        const _value = JSON.parse(value)
                                        _onChange(_value)
                                    }}
                                >

                                    {(Array.isArray(payment.transfer) && payment.transfer.length > 0) && (
                                        <div className="py-2">
                                            <div className="bg-slate-300 py-2 px-8">
                                                <h3 className="py-2 text-xs font-semibold tracking-wide">Transfer</h3>
                                            </div>
                                            <div className="flex flex-col">
                                                {payment.transfer.map((item) => {
                                                    const classActive = item.id_bank === value?.id
                                                    return item.is_active ? (
                                                        <RadioGroup.Item
                                                            key={item.id_bank}
                                                            className={clsx(
                                                                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                            )}
                                                            value={JSON.stringify({
                                                                id: item.id_bank,
                                                                bank: item.bank.toString(),
                                                                account: item.rekening,
                                                                name: item.pemilik,
                                                                payment_method: "tf"
                                                            })}
                                                            id={item.id_bank}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                    <BankLogo id={item.bank.toString()} />
                                                                </div>
                                                                <p className="text-xs text-gray-800 font-semibold">{item.bank}</p>
                                                            </div>
                                                        </RadioGroup.Item>
                                                    ) : null
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {isVa && (
                                        <>
                                            {(Array.isArray(payment.va) && payment.va.length > 0) && (
                                                <div className="py-2">
                                                    <div className="bg-slate-300 py-2 px-8">
                                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Virtual account</h3>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        {payment.va.map((item) => {
                                                            const account = item.bank_code.replaceAll("_", " ").toString()
                                                            const classActive = item.id_bank_va_xendit === value?.id
                                                            return item.is_active ? (
                                                                <RadioGroup.Item
                                                                    key={item.id_bank_va_xendit}
                                                                    className={clsx(
                                                                        "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                        classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                    )}
                                                                    value={JSON.stringify({
                                                                        id: item.id_bank_va_xendit,
                                                                        account: account,
                                                                        payment_method: "va",

                                                                    })}
                                                                    id={item.id_bank_va_xendit}
                                                                >
                                                                    {/* <li
                                                                key={item.id_bank_va_xendit}
                                                                className={clsx(
                                                                    "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                    classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                )}
                                                            > */}
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                            <BankLogo id={item.bank_code.toString()} />
                                                                        </div>
                                                                        <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                            {`Bank ${account}`}
                                                                        </p>
                                                                    </div>
                                                                    {/* <button
                                                                    type="button"
                                                                    className="absolute inset-0"
                                                                    onClick={(event) => {
                                                                        event.preventDefault()
                                                                        onChange({
                                                                            id: item.id_bank_va_xendit,
                                                                            account: account,
                                                                            payment_method: "va",

                                                                        })
                                                                    }}
                                                                >&nbsp;</button> */}
                                                                    {/* </li> */}
                                                                </RadioGroup.Item>
                                                            ) : null
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {(isQris || (product.typeProduct === "fisik")) && (
                                        <>
                                            <div className="py-2">
                                                <div className="bg-slate-300 py-2 px-8">
                                                    <h3 className="py-2 text-xs font-semibold tracking-wide">Lainnya {isQris.valueOf()}</h3>
                                                </div>

                                                {isQris && (
                                                    <>
                                                        {(Array.isArray(payment.settings) && payment.settings.length > 0) && (
                                                            <div className="flex flex-col">
                                                                {payment.settings.map((item) => {
                                                                    const classActive = item.id_setting_xendit === value?.id
                                                                    return item.status_qris ? (
                                                                        <RadioGroup.Item
                                                                            key={item.id_setting_xendit}
                                                                            className={clsx(
                                                                                "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                                classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                            )}
                                                                            value={JSON.stringify({
                                                                                id: item.id_setting_xendit,
                                                                                name: item.business_name,
                                                                                payment_method: "QRIS",
                                                                            })}
                                                                            id={item.id_setting_xendit}
                                                                        >
                                                                            {/* <li
                                                                        key={item.id_setting_xendit}
                                                                        className={clsx(
                                                                            "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                                            classActive ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                                        )}
                                                                    > */}
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                                    <BankLogo id="qris" />
                                                                                </div>
                                                                                <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                                    {`QRIS`}
                                                                                </p>
                                                                            </div>
                                                                            {/* <button
                                                                            type="button"
                                                                            className="absolute inset-0"
                                                                            onClick={(event) => {
                                                                                event.preventDefault()
                                                                                onChange({
                                                                                    id: item.id_setting_xendit,
                                                                                    name: item.business_name,
                                                                                    payment_method: "QRIS",
                                                                                })
                                                                            }}
                                                                        >&nbsp;</button> */}
                                                                            {/* </li> */}
                                                                        </RadioGroup.Item>
                                                                    ) : null
                                                                })}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Cod */}
                                            </div>
                                        </>
                                    )}

                                    {/* <div className="flex items-center">
                                        <RadioGroup.Item
                                            className="bg-white w-[25px] h-[25px] rounded-full outline-none cursor-default"
                                            value="default"
                                            id="r1"
                                        >
                                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-violet11" />
                                        </RadioGroup.Item>
                                        <label className="text-white text-[15px] leading-none pl-[15px]" htmlFor="r1">
                                            Default
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <RadioGroup.Item
                                            className="bg-white w-[25px] h-[25px] rounded-full outline-none cursor-default"
                                            value="comfortable"
                                            id="r2"
                                        >
                                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-violet11" />
                                        </RadioGroup.Item>
                                        <label className="text-white text-[15px] leading-none pl-[15px]" htmlFor="r2">
                                            Comfortable
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <RadioGroup.Item
                                            className="bg-white w-[25px] h-[25px] rounded-full outline-none cursor-default"
                                            value="compact"
                                            id="r3"
                                        >
                                            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-violet11" />
                                        </RadioGroup.Item>
                                        <label className="text-white text-[15px] leading-none pl-[15px]" htmlFor="r3">
                                            Compact
                                        </label>
                                    </div> */}
                                </RadioGroup.Root>

                                {/* <div className="mt-5"></div> */}
                                {/* {(Array.isArray(payment.transfer) && payment.transfer.length > 0) && (
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
                                                            <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                <BankLogo id={item.bank.toString()} />
                                                            </div>
                                                            <p className="text-xs text-gray-800 font-semibold">{item.bank}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={(event) => {
                                                                event.preventDefault()
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
                                )} */}

                                {/* {isVa && (
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
                                                                    <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                        <BankLogo id={item.bank_code.toString()} />
                                                                    </div>
                                                                    <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                        {`Bank ${account}`}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0"
                                                                    onClick={(event) => {
                                                                        event.preventDefault()
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
                                )} */}

                                {/* {(isQris || (product.typeProduct === "fisik")) && (
                                    <>
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
                                                                            <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                                <BankLogo id="qris" />
                                                                            </div>
                                                                            <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                                {`QRIS`}
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="absolute inset-0"
                                                                            onClick={(event) => {
                                                                                event.preventDefault()
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

                                            {product.typeProduct === "fisik" && (
                                                <ul className="flex flex-col gap-3">
                                                    <li
                                                        className={clsx(
                                                            "relative overflow-hidden py-2.5 bg-gray-100 border-b px-8",
                                                            "COD" === value?.id.toString() ? "bg-slate-400/40" : "border-transparent hover:bg-slate-300/40"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-5 p-1 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                <BankLogo id="cod" />
                                                            </div>
                                                            <p className="text-xs text-gray-800 font-semibold uppercase">
                                                                {`COD (Cash On Delivery)`}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={(event) => {
                                                                event.preventDefault()
                                                                onChange({
                                                                    id: "COD",
                                                                    payment_method: "COD"
                                                                })
                                                            }}
                                                        >&nbsp;</button>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    </>
                                )} */}

                                <div className="px-12 py-6 flex flex-col">
                                    <button
                                        type="button"
                                        className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            // if (event) {
                                            //     if (typeof event.preventDefault === "function") {
                                            //         event.preventDefault();
                                            //     }
                                            //     if (typeof event.stopPropagation === "function") {
                                            //         event.stopPropagation();
                                            //     }
                                            // }

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
                                    <span className="text-[13px] leading-none text-stora-500 block">Tampilkan Semua</span>
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

    return (
        <>
            <div className="">
                {!!product && (
                    <>
                        {product.typeProduct !== "link" && (
                            <div className="px-8 sm:px-12">
                                <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Checkout</h3>
                            </div>
                        )}
                    </>
                )}
                
                <form onSubmit={(event) => {
                    submitAction(event)
                    if (event) {
                        if (typeof event.preventDefault === "function") {
                            event.preventDefault()
                        }
                        if (typeof event.stopPropagation === "function") {
                            event.stopPropagation()
                        }
                    }
                }}>
                    {product.typeProduct !== "link" ? (
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
                                                                        "relative px-4 py-3 shadow rounded-lg border-2 bg-slate-50 hover:shadow-lg",
                                                                        value === item.name ? "border-stora-400/50 bg-slate-300/40" : "border-transparent"
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
                                                            const afterPrice = !product.isFree
                                                                ? Number(item.price)
                                                                : 0
                                                            return (
                                                                <li
                                                                    key={item.id}
                                                                    className={clsx(
                                                                        "relative px-4 py-3 shadow rounded-lg border-2 bg-slate-50 hover:shadow-lg",
                                                                        item.name === value ? "border-stora-400/50 bg-slate-300/40" : "border-transparent"
                                                                    )}
                                                                >
                                                                    <span className="text-xs">{item.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="absolute inset-0"
                                                                        onClick={() => {
                                                                            onChange(item.name)
                                                                            // set_checkout
                                                                            setCheckout((prevState) => {
                                                                                const cekRandCode = afterPrice > 0 || prevState.ongkir > 0
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
                                                                                    cekRandCode ? prevState.randCode.toString() : "0"
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
                                    const { onChange, ref, value, ...rest } = field
                                    let ongkir = 0
                                    if (currentShipping) {
                                        if (!product.isFreeOngkir) {
                                            ongkir = !Number.isNaN(parseInt(currentShipping.price.toString()))
                                                ? Number(currentShipping.price)
                                                : 0
                                        }
                                    }

                                    const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                                        const _val = event.target.value
                                        let qty = !Number.isNaN(parseInt(_val))
                                            ? Number(_val)
                                            : 0
                                        if (Number.isNaN(qty)) {
                                            qty = 0
                                        }

                                        if (qty <= 0) {
                                            event.target.value = "1"
                                            qty = 1
                                        }

                                        if (qty >= 1000) {
                                            event.target.value = "1000"
                                            qty = 1000
                                        }

                                        onChange(event)
                                        // set_checkout
                                        setCheckout((prevState) => {
                                            const cekRandCode = prevState.afterPrice > 0 || prevState.ongkir > 0
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
                                                cekRandCode ? prevState.randCode.toString() : "0"
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
                                    }

                                    return (
                                        <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                            <label className="text-[13px] leading-none mb-2.5 block" htmlFor="jumlah">
                                                Jumlah
                                            </label>
                                            <input
                                                {...rest}
                                                ref={ref}
                                                value={value}
                                                onChange={_onChange}
                                                className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                                placeholder="Jumlah"
                                            />
                                        </fieldset>
                                    )
                                }}
                            />

                            <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 block" htmlFor="nama_lengkap">
                                    Nama Lengkap
                                </label>
                                <input
                                    {...(register("nama_lengkap", { required: true }))}
                                    className={clsx(
                                        "grow shrink-0 rounded-lg px-3 text-[13px] leading-none h-[40px] outline-none",
                                        errors.nama_lengkap?.message ? "shadow-[0_0_0_2px] shadow-red-300" : "shadow-stora-200 shadow-[0_0_0_1px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300",
                                    )}
                                    placeholder="Nama Lengkap"
                                />
                                {errors.nama_lengkap?.message && <p className="text-xs pl-1 text-red-500 mt-1">Nama tidak boleh kosong.</p>}
                            </fieldset>

                            <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 block" htmlFor="nomor_whatsapp">
                                    Nomor WhatsApp
                                </label>
                                <input
                                    {...(register("nomor_whatsapp", { required: true }))}
                                    className={clsx(
                                        "grow shrink-0 rounded-lg px-3 text-[13px] leading-none h-[40px] outline-none",
                                        errors.nomor_whatsapp?.message ? "shadow-[0_0_0_2px] shadow-red-300" : "shadow-stora-200 shadow-[0_0_0_1px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300"
                                    )}
                                    placeholder="Nomor WhatsApp"
                                />
                                {errors.nomor_whatsapp?.message && <p className="text-xs pl-1 text-red-500 mt-1">Nomor WhatsApp tidak boleh kosong.</p>}
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
                                    <div className={clsx(
                                        "w-full min-h-[75px] bg-slate-50 rounded-lg p-6",
                                        errorPengiriman ? "border border-red-500" : ""
                                    )}>
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
                                                            <span className="text-[13px] leading-none text-stora-500 block">Tambah Alamat</span>
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
                                                                userId={product.userId}
                                                                weight={product.weight}
                                                                onSelected={(val) => {
                                                                    onOpenAddressChange(false)
                                                                    let ongkir = 0
                                                                    // if (val.shipping) {
                                                                    //     const price = !Number.isNaN(parseInt(val.shipping.price.toString()))
                                                                    //         ? Number(val.shipping.price)
                                                                    //         : 0
                                                                    //     ongkir = price
                                                                    //     const shipping: ShippingType = {
                                                                    //         service_code: val.shipping.service_code,
                                                                    //         service_name: val.shipping.service_name,
                                                                    //         price: val.shipping.price,
                                                                    //         etd: val.shipping.etd
                                                                    //             ? val.shipping.etd
                                                                    //             : "",
                                                                    //         discount_price: val.shipping.discount_price,
                                                                    //         cashless_discount_price: val.shipping.cashless_discount_price,
                                                                    //         s_name: val.shipping.s_name
                                                                    //             ? val.shipping.s_name
                                                                    //             : "",
                                                                    //     }
                                                                    //     setCurrentShipping((prevState) => {
                                                                    //         return {
                                                                    //             ...(prevState ? prevState : {}),
                                                                    //             ...shipping,
                                                                    //         }
                                                                    //     })
                                                                    // }
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
                                                                        const subTotal = multiplySubTotal(
                                                                            prevState.qty.toString(),
                                                                            prevState.afterPrice.toString()
                                                                        )
                                                                        const totalOngkir = sumTotal(
                                                                            subTotal.toString(),
                                                                            (ongkir || 0).toString()
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
                                                                            ongkir,
                                                                            total: totalCoupon,
                                                                        }
                                                                    })
                                                                    setCurrentShipping(null)
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
                                            <>
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
                                                <div className="flex items-center justify-between my-2">
                                                    <div className="text-xs">Informasi Pengiriman:</div>
                                                    <Dialog.Root
                                                        open={isOpenShipping}
                                                        onOpenChange={onOpenShippingChange}
                                                    >
                                                        <Dialog.Trigger asChild>
                                                            <button className="inline-flex items-center justify-center text-xs font-normal leading-none focus:outline-none">
                                                                <span className="text-[13px] leading-none text-stora-500 block">Ubah Pengiriman</span>
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
                                            </>
                                        )}

                                        {!!currentShipping && (
                                            <>
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
                                                                        const subTotal = multiplySubTotal(
                                                                            prevState.qty.toString(),
                                                                            prevState.afterPrice.toString()
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
                                                                            discount.toString()
                                                                        )

                                                                        return {
                                                                            ...prevState,
                                                                            total: totalCoupon > 0 ? totalCoupon : 0,
                                                                        }
                                                                    })
                                                                    // close coupon modal
                                                                    setIsOpenCoupon(false)
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
                                        <div className="relative mb-3">
                                            <div className="bg-slate-50 rounded-lg p-4 flex flex-col">
                                                <div className="flex justify-between">
                                                    <span className="text-xs">
                                                        {couponData.coupon}
                                                    </span>
                                                    <span className="text-xs mr-6">{toIDR(couponData.discount.toString())}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCouponData(null)
                                                }}
                                                className="absolute top-2 right-3 w-5 rounded-full shadow hover:bg-slate-200 flex justify-center items-center"
                                            >
                                                <TrashIcon className="w-4 h-5 text-red-500" />
                                            </button>
                                        </div>
                                    )}

                                    {(!product.isFree || !product.isFreeOngkir) && selectPaymentMethod()}
                                </>
                            )}

                            {Boolean(product.typeProduct === "digital") && (
                                <>
                                    {!product.isFree && selectPaymentMethod()}
                                </>
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
                                        {product.typeProduct === "fisik" ? (
                                            <>
                                                {(!product.isFree || !product.isFreeOngkir) && (
                                                    <>
                                                        {codeUnique && (
                                                            <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                                                <span className="text-gray-800 text-[13px] font-medium tracking-wide">Kode Unik</span>
                                                                <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                                                    {getLastThreeWords(checkout.total.toString())}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {!product.isFree && (
                                                    <>
                                                        {codeUnique && (
                                                            <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                                                <span className="text-gray-800 text-[13px] font-medium tracking-wide">Kode Unik</span>
                                                                <span className="text-gray-800 text-[13px] font-normal tracking-wide">
                                                                    {getLastThreeWords(checkout.total.toString())}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </>
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
                                                    {!!currentShipping
                                                        ? toIDR(currentShipping.price.toString())
                                                        : toIDR("0")}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between border-b border-gray-100 mb-1">
                                            <span className="text-gray-800 text-[13px] font-medium tracking-wide">Diskon</span>
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
                    ) : <div className="pb-[250px]"></div>}

                    {product.typeProduct !== "link" ? (
                        <div className="fixed bottom-0 z-40 inset-x-0 pb-8 sm:pb-6">
                            <div className="w-full max-w-lg mx-auto px-8">
                                <div className="h-12 flex gap-3 items-center justify-between bg-stora-500 rounded-lg px-3 shadow">
                                    <span className="text-sm tracking-wide text-white">
                                        {toIDR(checkout.total.toString())}
                                    </span>
                                    <div className="flex gap-3">
                                        {isCart && (
                                            <div>
                                                <button
                                                    type="button"
                                                    className="flex flex-col items-center justify-center rounded-lg px-2 text-[10px] sm:text-xs leading-none font-medium h-[35px] text-white border border-stora-50 hover:bg-stora-100/25 focus:shadow focus:shadow-gray-300/75 outline-none cursor-default"
                                                    disabled={loadingCreateOrder}
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        shoppingCarts()
                                                    }}
                                                >
                                                    Masukkan Keranjang
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="inline-flex items-center justify-center rounded-lg px-4 text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default"
                                            disabled={loadingCreateOrder}
                                        >
                                            {product.textBtnOrder}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="fixed bottom-0 z-40 inset-x-0 pb-8 sm:pb-6">
                            <div className="w-full max-w-lg mx-auto px-8">
                                <div className="h-12 flex gap-3 items-center justify-between bg-stora-500 rounded-lg px-3 shadow">
                                    <span className="text-sm tracking-wide text-white">
                                        {toIDR(checkout.total.toString())}
                                    </span>
                                    <div className="flex gap-3">
                                        <Link
                                            target="_blank"
                                            href={product.link}
                                            className="inline-flex items-center justify-center rounded-lg px-4 text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default"
                                        >
                                            {product.textBtnOrder}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {loadingCreateOrder && (
                <div className="z-50 overflow-hidden w-full h-screen fixed inset-0 bg-slate-300/25 flex flex-col items-center justify-center">
                    <ILoading />
                </div>
            )}

            <Toast.Provider swipeDirection="right" duration={3000} swipeThreshold={3} label="Error checkout">
                <Toast.Root
                    className="bg-white rounded-lg shadow border p-3 flex justify-between items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_100ms_ease-out] data-[swipe=end]:animate-swipeOut"
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
                    <Toast.Close className="[grid-area:_action]" asChild>
                        <button className="inline-flex items-center justify-center rounded font-normal text-xs px-[10px] leading-[25px] h-[25px]  focus:shadow-[0_0_0_2px] focus:shadow-gray-500">
                            Oke
                        </button>
                    </Toast.Close>
                </Toast.Root>
                <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-24 sm:bottom-20 flex flex-col px-8 gap-[10px] w-full max-w-lg m-0 list-none z-[2147483647] outline-none" />
            </Toast.Provider>
        </>
    )
}