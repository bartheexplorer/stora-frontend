"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { IFormValueCheckoutSchema, type IFormValueCheckout } from "./form-checkout-type"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Dialog from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { useState } from "react"

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
        productId: string
        typeProduct: string
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
}

export default function IFormCheckout({
    variations,
    sizes,
    product,
}: IFormCheckoutProps) {
    const [isOpenAddress, setIsOpenAddress] = useState<boolean>(false)
    const [isOpenShipping, setIsOpenShipping] = useState<boolean>(false)
    const {
        register,
        handleSubmit,
        control,
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
            }))
        }
    })

    const { fields } = useFieldArray({ control, name: "custom_fields" })

    const submitAction = handleSubmit((data) => {
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

    return (
        <>
            <div className="px-12">
                <h3 className="mb-2">Checkout</h3>

                <form onSubmit={submitAction}>
                    {(Array.isArray(variations) && variations.length > 0) && (
                        <>
                            <h3 className="text-xs leading-none mb-2.5 text-violet12 block">Variasi</h3>
                            <ul className="flex flex-wrap gap-4 mb-4">
                                {variations.map((item) => {
                                    return (
                                        <li key={item.id} className="px-3 py-2 shadow rounded-lg">
                                            <span className="text-xs">{item.name}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </>
                    )}

                    {(Array.isArray(sizes) && sizes.length > 0) && (
                        <>
                            <h3 className="text-xs leading-none mb-2.5 text-violet12 block">Size</h3>
                            <ul className="flex flex-wrap gap-4 mb-4">
                                {sizes.map((item) => {
                                    return (
                                        <li key={item.id} className="px-3 py-2 shadow rounded-lg">
                                            <span className="text-xs">{item.name}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </>
                    )}

                    <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                        <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="jumlah">
                            Jumlah
                        </label>
                        <select
                            {...(register("jumlah", { required: true }))}
                            className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
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
                            className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                            placeholder="Nama Lengkap"
                        />
                    </fieldset>

                    <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                        <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="nomor_whatsapp">
                            Nomor WhatsApp
                        </label>
                        <input
                            {...(register("nomor_whatsapp", { required: true }))}
                            className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
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
                                                    className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
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
                                                    className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                                                >
                                                    {item.options.map((item) => {
                                                        return (
                                                            <option value={item.value}>{item.value}</option>
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
                                                    className="grow shrink-0 rounded p-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 max-h-[60px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
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
                            <div className="w-full min-h-[75px] bg-gray-100 rounded-lg p-4">
                                <div className="text-xs mb-2">Alamat Pengiriman:</div>

                                <Dialog.Root
                                    open={isOpenAddress}
                                    onOpenChange={onOpenAddressChange}
                                >
                                    <Dialog.Trigger asChild>
                                        <button className="text-violet11 shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-lg text-xs bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:outline-none">
                                            Tambah Alamat
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Portal>
                                        <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                        <Dialog.Content className="overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                            <div>
                                                <Dialog.Title className="text-mauve12 m-0 text-sm font-medium">
                                                    Alamat Penerima
                                                </Dialog.Title>
                                                {/* Address data */}
                                                <Dialog.Close asChild>
                                                    <button
                                                        className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                        aria-label="Close"
                                                    >
                                                        <Cross2Icon />
                                                    </button>
                                                </Dialog.Close>
                                            </div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                </Dialog.Root>

                                <div className="text-xs mt-3 mb-2">Informasi Pengiriman:</div>

                                <div>
                                    <p className="text-xs">
                                        <span className="uppercase">Nama pengiriman</span>{", "}
                                        Nama service
                                    </p>
                                    <p className="text-xs italic">1 - 7 Hari</p>
                                </div>

                                <Dialog.Root
                                    open={isOpenShipping}
                                    onOpenChange={onOpenShippingChange}
                                >
                                    <Dialog.Trigger asChild>
                                        <button className="text-violet11 inline-flex items-center justify-center text-xs font-medium leading-none focus:outline-none">
                                            Ubah Pengiriman
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Portal>
                                        <Dialog.Overlay className="bg-white data-[state=open]:animate-overlayShow fixed inset-0" />
                                        <Dialog.Content className="overflow-y-scroll data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow focus:outline-none">
                                            <div>
                                                <Dialog.Title className="text-mauve12 m-0 text-sm font-medium">
                                                    Pengiriman
                                                </Dialog.Title>
                                                {/* Form shipping data */}
                                                <Dialog.Close asChild>
                                                    <button
                                                        className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                                        aria-label="Close"
                                                    >
                                                        <Cross2Icon />
                                                    </button>
                                                </Dialog.Close>
                                            </div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                </Dialog.Root>
                            </div>

                            <div>
                                typeProduct fisik
                            </div>
                        </div>
                    )}

                    {Boolean(product.typeProduct === "digital") && (
                        <div>
                            typeProduct digital
                        </div>
                    )}


                    <div className="flex justify-end mt-5">
                        <button className="inline-flex items-center justify-center rounded px-[15px] text-[15px] leading-none font-medium h-[35px] bg-green4 text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 outline-none cursor-default">
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}