"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { IFormValueCheckoutSchema, type IFormValueCheckout } from "./form-checkout-type"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Dialog from "@radix-ui/react-dialog"
import { CaretRightIcon, Cross2Icon } from "@radix-ui/react-icons"
import { useContext, useState } from "react"
import IFormAddressArveoli from "./form-address-arveoli"
import { toIDR } from "@/utils/to-idr"
import { OrderContext } from "@/context/order"
import clsx from "clsx"

interface IFormCheckoutProps {
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
            id_bank: string // item.id_bank.toString(), // 21,
            bank: string // item.bank, // "BANK CENTRAL ASIA",
            rekening: string // item.rekening, // "799199191",
            pemilik: string // item.pemilik, // "Klikdigital Indonesia",
            is_active: boolean // Boolean(item.is_active === "SATU"), // "SATU",
        }[]
        va: {
            id_bank_va_xendit: string // item.id_bank_va_xendit.toString(), // 35,
            bank_code: string // item.bank_code, // "BCA",
            is_active: boolean // Boolean(item.is_active === "SATU"), // "SATU"
        }[]
        settings: {
            id_setting_xendit: string // item.id_setting_xendit.toString(), // 19,
            business_name: string // item.business_name, // "admin",
            country: string // item.country, // "ID",
            is_active: boolean // Boolean(item.is_active === "SATU"), // "SATU",
            is_blocked: boolean // Boolean(item.is_blocked === "SATU"), // "NOL",
            status_qris: boolean // Boolean(item.status_qris === "SATU"), // "SATU",
            status_va: boolean // Boolean(item.status_va === "SATU"), // "SATU",
            fee: "seller" | "customer" | null // item.fee, // "seller"
        }[]
    }
}

export default function IFormCheckout({
    variations,
    sizes,
    product,
    payment,
}: IFormCheckoutProps) {
    const { shippingArveoli } = useContext(OrderContext)
    const [isOpenAddress, setIsOpenAddress] = useState<boolean>(false)
    const [isOpenShipping, setIsOpenShipping] = useState<boolean>(false)
    const [isOpenPayment, setIsOpenPayment] = useState<boolean>(false)
    const [checkout, setCheckout] = useState<{
        total: number
        price: number
        afterPrice: number
    }>({
        total: product.price,
        price: product.price,
        afterPrice: product.price,
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
            service_code: string // "CTC23",
            service_name: string // "CTC",
            price: string | number // "960000",
            etd: string // "2 - 3 hari",
            discount_price: string | number // 960000,
            cashless_discount_price: string | number // 960000,
            s_name: any // "jne"
        } | null
    } | null>(null)
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
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
        }
    })

    const { fields } = useFieldArray({ control, name: "custom_fields" })

    const submitAction = handleSubmit((data) => {
        if ((Array.isArray(variations) && variations.length > 0)) {
            if (!data.variasi || typeof data.variasi !== "string") {
                console.log("error")
                return
            }
        }

        if (Array.isArray(sizes) && sizes.length > 0) {
            if (!data.ukuran || typeof data.ukuran !== "string") {
                console.log("error")
                return
            }
        }

        if (!product.isFree) {
            if (!data.payment) {
                console.log("Error")
                return
            }
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
        return array
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
                                                    <li key={item.service_code} className="relative p-2 bg-gray-100 rounded-lg shadow border border-transparent hover:border-green-500">
                                                        <p className="text-xs text-gray-800 mb-1.5">{item.service_name}</p>
                                                        {!!item.price && (
                                                            <p className="text-xs text-gray-800 mb-1.5">{toIDR(item.price.toString())}</p>
                                                        )}
                                                        <p className="text-xs text-gray-800">{item.etd}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                console.log(item)
                                                                setIsOpenShipping(false)
                                                                setAddress((prevState) => {
                                                                    if (!prevState) return prevState
                                                                    return {
                                                                        ...prevState,
                                                                        shipping: {
                                                                            ...(prevState?.shipping ? prevState.shipping : {}),
                                                                            s_name,
                                                                            service_code: item.service_code,
                                                                            service_name: item.service_name,
                                                                            price: item.price,
                                                                            etd: item.etd,
                                                                            discount_price: item.discount_price,
                                                                            cashless_discount_price: item.cashless_discount_price,
                                                                        }
                                                                    }
                                                                })
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
            ) : null
    }

    const paymentComponent = () => {
        return (
            <div className="px-6">
                <Controller
                    name="payment"
                    control={control}
                    render={({ field }) => {
                        const { onChange: onChangeVal } = field
                        const onChange = (vl?: { id?: string; name?: string; account?: string; payment_method?: string }) => {
                            onChangeVal(vl)
                        }

                        return (
                            <>
                                {(Array.isArray(payment.transfer) && payment.transfer.length > 0) && (
                                    <div className="py-2">
                                        <h3 className="py-2 text-xs font-semibold tracking-wide">Transfer</h3>
                                        <ul className="flex flex-wrap gap-3">
                                            {payment.transfer.map((item) => {
                                                return item.is_active ? (
                                                    <li key={item.id_bank} className="relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border border-transparent hover:border-stora-500">
                                                        <p className="text-xs">{item.bank}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                onChange({
                                                                    id: item.bank,
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
                                                return item.is_active ? (
                                                    <li key={item.id_bank_va_xendit} className="relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border border-transparent hover:border-stora-500">
                                                        <p className="text-xs uppercase">Bank {item.bank_code}</p>
                                                        <button
                                                            type="button"
                                                            className="absolute inset-0"
                                                            onClick={() => {
                                                                onChange({
                                                                    id: item.id_bank_va_xendit,
                                                                    account: item.bank_code,
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
                                                    <li key={item.id_setting_xendit} className="relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border border-transparent hover:border-stora-500">
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
                                                <li className="relative overflow-hidden p-3 bg-gray-100 rounded-lg shadow border border-transparent hover:border-stora-500">
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

                            </>
                        )
                    }}
                />
            </div>
        )
    }

    console.log(errors)

    return (
        <>
            <div className="">
                <div className="px-8 sm:px-12">
                    <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-800">Checkout</h3>
                </div>

                <form onSubmit={submitAction}>
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
                                                        return (
                                                            <li
                                                                key={item.id}
                                                                className={clsx(
                                                                    "relative px-4 py-3 shadow rounded-lg border hover:border-stora-500",
                                                                    item.name === value ? "border-stora-500" : "border-transparent"
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

                        <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                            <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="jumlah">
                                Jumlah
                            </label>
                            <select
                                {...(register("jumlah", { required: true }))}
                                className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                            >
                                {num().map((item) => (<option key={item} value={item}>{item}</option>))}
                            </select>
                        </fieldset>

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
                            <div>
                                <div className="w-full min-h-[75px] bg-gray-100 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs">Alamat Pengiriman:</div>
                                        <Dialog.Root
                                            open={isOpenAddress}
                                            onOpenChange={onOpenAddressChange}
                                        >
                                            <Dialog.Trigger asChild>
                                                {!!address ? (
                                                    <button className="inline-flex items-center justify-center text-xs font-medium leading-none focus:outline-none">
                                                        <span className="text-[13px] leading-none text-stora-500 block">Ubah Alamat</span>
                                                        <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                    </button>
                                                ) : (
                                                    <button className="inline-flex items-center justify-center text-xs font-medium leading-none focus:outline-none">
                                                        <span className="text-[13px] leading-none text-stora-500 block">Tambah alamat</span>
                                                        <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                    </button>
                                                )}
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                <Dialog.Content className="overflow-y-scroll z-40 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                    <div className="py-8">
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
                                                                // setAddress()
                                                                console.log(val)
                                                                setAddress(() => val)
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
                                                {`${address.address}, 
                                                    ${address.urban_village}, 
                                                    ${address.sub_district},
                                                    ${address.regency},
                                                    ${address.province}
                                                `}
                                            </p>
                                            <p className="text-xs">
                                                {`Kode Pos: ${address.zip_code}`}
                                            </p>
                                        </div>
                                    )}

                                    {!!address && (
                                        <>
                                            <div className="flex items-center justify-between my-2">
                                                <div className="text-xs">Informasi Pengiriman:</div>
                                                <Dialog.Root
                                                    open={isOpenShipping}
                                                    onOpenChange={onOpenShippingChange}
                                                >
                                                    <Dialog.Trigger asChild>
                                                        <button className="inline-flex items-center justify-center text-xs font-medium leading-none focus:outline-none">
                                                            <span className="text-[13px] leading-none text-stora-500 block">Ubah pengiriman</span>
                                                            <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                        </button>
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                        <Dialog.Content className="overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                                            <div className="py-6">
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
                                                    {address.shipping?.service_name}{" "}
                                                    {address.shipping?.price
                                                        ? toIDR(address.shipping.price.toString())
                                                        : ""}
                                                </p>
                                                {!!address.shipping?.etd && (
                                                    <p className="text-xs italic">{address.shipping.etd}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between my-4">
                                    <div className="text-[13px]">Metode Pembayaran</div>
                                    <div>
                                        <Dialog.Root
                                            open={isOpenPayment}
                                            onOpenChange={setIsOpenPayment}
                                        >
                                            <Dialog.Trigger asChild>
                                                <button className="text-violet11 inline-flex items-center justify-center text-xs font-medium leading-none focus:outline-none">
                                                    <span className="text-[13px] leading-none text-stora-500 block">Tampilkan semua</span>
                                                    <CaretRightIcon className="h-5 w-5 text-stora-500" />
                                                </button>
                                            </Dialog.Trigger>
                                            <Dialog.Portal>
                                                <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                                <Dialog.Content className="overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
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
                            </div>
                        )}

                        {Boolean(product.typeProduct === "digital") && (
                            <div>
                                typeProduct digital
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-0 inset-x-0 pb-8 sm:pb-6">
                        <div className="w-full max-w-lg mx-auto px-3">
                            <div className="h-12 flex items-center justify-between bg-stora-500 rounded-lg px-3">
                                <span className="text-sm tracking-wide text-white">{toIDR(checkout.afterPrice.toString())}</span>
                                <button className="inline-flex items-center justify-center rounded-lg px-[15px] text-xs leading-none font-medium h-[35px] bg-storano-500 text-white hover:bg-storano-500/75 focus:shadow focus:shadow-storano-400 outline-none cursor-default">
                                    {product.textBtnOrder}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}