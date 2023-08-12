import {
    useProvinceArveoli,
    useRegencyArveoli,
    useShippingArveoli,
    useSubDistrictArveoli,
    useUrbanVillageArveoli,
} from "@/hooks/arveoli"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { type IFormValueAddressArveoli, IFormValueAddressArveoliSchema } from "./form-address-arveoli-type"
import { useContext, useState } from "react"
import ILoading from "../loading"
import { OrderContext, toShipping } from "@/context/order"

interface IFormAddressArveoliProps {
    userId: string
    weight: string
    isFreeOngkir: boolean
    onSelected: (params: {
        province: string
        regency: string
        id_mapping: string
        sub_district: string
        urban_village: string
        zip_code: string
        address: string
        shipping?: {
            service_code: string
            service_name: string
            price: number
            etd?: string | null
            discount_price: number
            cashless_discount_price: number
            s_name: string
        } | null
    }) => void
}

export default function IFormAddressArveoli(props: IFormAddressArveoliProps) {
    const { setOrderState } = useContext(OrderContext)
    const [mapping, setMapping] = useState<{
        id_mapping: string
        zip_code: string
        name: string
    } | null>(null)
    const {
        data: provinsi,
        isLoading: loadingProvince,
    } = useProvinceArveoli()
    const {
        sendRequest: getRegency,
        data: regencies,
        isLoading: loadingRegency,
    } = useRegencyArveoli()
    const {
        sendRequest: getSubDistrict,
        data: subDistrict,
        isLoading: loadingSubDistrict,
    } = useSubDistrictArveoli()
    const {
        sendRequest: getUrbanVillage,
        data: urbanVillages,
        isLoading: loadingUrbanVilages,
    } = useUrbanVillageArveoli()
    const {
        sendRequest: getShipping,
        data: shipping,
        isLoading: loadingShipping,
    } = useShippingArveoli()
    const {
        register,
        control,
        handleSubmit,
        setValue,
        resetField,
    } = useForm<IFormValueAddressArveoli>({
        resolver: zodResolver(IFormValueAddressArveoliSchema)
    })

    const onSubmitAction = handleSubmit(async (data) => {
        if (!props.isFreeOngkir) {
            if (mapping) {
                const { data: shipper } = await getShipping({
                    userId: props.userId,
                    weight: props.weight,
                    destination: mapping.id_mapping,
                })
                const shippingArray = toShipping(shipper.data)
    
                setOrderState(() => ({
                    shippingArveoli: shipper,
                }))
    
                props.onSelected({
                    province: data.province,
                    regency: data.regency,
                    sub_district: data.subDistrict,
                    urban_village: mapping.name,
                    address: data.address,
                    id_mapping: mapping.id_mapping,
                    zip_code: mapping.zip_code,
                    shipping: {
                        service_code: shippingArray?.service_code
                            ? shippingArray.service_code
                            : "",
                        service_name: shippingArray?.service_name
                            ? shippingArray.service_name
                            : "",
                        price: shippingArray?.price
                            ? !Number.isNaN(parseInt(shippingArray.price.toString()))
                                ? Number(shippingArray.price)
                                : 0
                            : 0,
                        etd: shippingArray?.etd
                            ? shippingArray.etd
                            : null,
                        discount_price: shippingArray?.discount_price
                            ? !Number.isNaN(parseInt(shippingArray.discount_price.toString()))
                                ? Number(shippingArray?.discount_price)
                                : 0
                            : 0,
                        cashless_discount_price: shippingArray?.cashless_discount_price
                            ? !Number.isNaN(parseInt(shippingArray.cashless_discount_price.toString()))
                                ? Number(shippingArray.cashless_discount_price)
                                : 0
                            : 0,
                        s_name: shippingArray?.s_name
                            ? shippingArray.s_name
                            : ""
                    },
                })
            }
        } else {
            props.onSelected({
                province: data.province,
                regency: data.regency,
                sub_district: data.subDistrict,
                urban_village: mapping?.name ? mapping.name : "",
                address: data.address,
                id_mapping: mapping?.id_mapping ? mapping.id_mapping : "",
                zip_code: mapping?.zip_code ? mapping.zip_code : "",
                shipping: null,
            })
        }
    })

    return (
        <div className="py-4 px-8 w-full">
            <form onSubmit={(event) => {
                onSubmitAction(event)
                if (event) {
                    if (typeof event.preventDefault === "function") {
                        event.preventDefault()
                    }
                    if (typeof event.stopPropagation === "function") {
                        event.stopPropagation()
                    }
                }
            }}>
                <Controller
                    name="province"
                    control={control}
                    render={({ field }) => {
                        const { ref, onChange, ...rest } = field
                        return (
                            <fieldset className="relative mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="subDistrict">
                                    Provinsi
                                </label>
                                <select
                                    {...rest}
                                    ref={ref}
                                    className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                    onChange={(event) => {
                                        onChange(event)
                                        if (event.target.value.length > 0) {
                                            getRegency({
                                                provinceId: event.target.value,
                                            })
                                        }
                                        // Reset
                                        resetField("regency")
                                        resetField("subDistrict")
                                        resetField("urbanVillage")
                                        resetField("kodepos")
                                    }}
                                >
                                    <option value="">Pilih</option>
                                    {provinsi?.data.province.map((item) => {
                                        return <option key={item.name}>{item.name}</option>
                                    })}
                                </select>
                                {loadingProvince && (
                                    <div className="absolute right-1 bottom-0">
                                        <ILoading />
                                    </div>
                                )}
                            </fieldset>
                        )
                    }}
                />

                <Controller
                    name="regency"
                    control={control}
                    render={({ field }) => {
                        const { ref, onChange, ...rest } = field
                        return (
                            <fieldset className="relative mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="subDistrict">
                                    Kabupaten
                                </label>
                                <select
                                    {...rest}
                                    ref={ref}
                                    className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                    onChange={(event) => {
                                        onChange(event)
                                        if (event.target.value.length > 0) {
                                            getSubDistrict({
                                                regencyId: event.target.value,
                                            })
                                        }
                                        // Reset
                                        resetField("subDistrict")
                                        resetField("urbanVillage")
                                        resetField("kodepos")
                                    }}
                                >
                                    <option value="">Pilih</option>
                                    {regencies?.data.city.map((item) => {
                                        return <option key={item.name}>{item.name}</option>
                                    })}
                                </select>
                                {loadingRegency && (
                                    <div className="absolute right-1 bottom-0">
                                        <ILoading />
                                    </div>
                                )}
                            </fieldset>
                        )
                    }}
                />

                <Controller
                    name="subDistrict"
                    control={control}
                    render={({ field }) => {
                        const { ref, onChange, ...rest } = field
                        return (
                            <fieldset className="relative mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="subDistrict">
                                    Kecamatan
                                </label>
                                <select
                                    {...rest}
                                    ref={ref}
                                    className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                    onChange={(event) => {
                                        onChange(event)
                                        if (event.target.value.length > 0) {
                                            getUrbanVillage({
                                                subDistrictId: event.target.value,
                                            })
                                        }
                                        // Reset
                                        resetField("urbanVillage")
                                        resetField("kodepos")
                                    }}
                                >
                                    <option value="">Pilih</option>
                                    {subDistrict?.data.district.map((item) => {
                                        return <option key={item.name}>{item.name}</option>
                                    })}
                                </select>
                                {loadingSubDistrict && (
                                    <div className="absolute right-1 bottom-0">
                                        <ILoading />
                                    </div>
                                )}
                            </fieldset>
                        )
                    }}
                />

                <Controller
                    name="urbanVillage"
                    control={control}
                    render={({ field }) => {
                        const { ref, onChange, ...rest } = field
                        return (
                            <fieldset className="relative mb-[15px] w-full flex flex-col justify-start">
                                <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="urbanVillage">
                                    Kelurahan
                                </label>
                                <select
                                    {...rest}
                                    ref={ref}
                                    className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                                    onChange={(event) => {
                                        onChange(event)
                                        if (event.target.value && typeof event.target.value === "string") {
                                            const value = JSON.parse(event.target.value) as {
                                                id_mapping: string
                                                name: string
                                                zip_code: string
                                            }
                                            console.log("value", value)
                                            setMapping((prevState) => ({
                                                ...prevState,
                                                id_mapping: value.id_mapping.toString(),
                                                name: value.name,
                                                zip_code: value.zip_code.toString(),
                                            }))
                                            setValue("kodepos", value.zip_code)
                                        }
                                    }}
                                >
                                    <option value="">Pilih</option>
                                    {urbanVillages?.data.sub_district.map((item) => {
                                        return <option
                                            key={item.id_mapping}
                                            value={`${JSON.stringify({
                                                id_mapping: item.id_mapping,
                                                name: item.name,
                                                zip_code: item.zip_code,
                                            })}`}
                                        >{`${item.name}`}</option>
                                    })}
                                </select>
                                {loadingUrbanVilages && (
                                    <div className="absolute right-1 bottom-0">
                                        <ILoading />
                                    </div>
                                )}
                            </fieldset>
                        )
                    }}
                />

                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="kodepos">
                        Kode Pos
                    </label>
                    <input
                        {...register("kodepos", { required: true })}
                        type="text"
                        placeholder="Kode Pos"
                        className="grow shrink-0 rounded-lg px-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[40px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                    />
                </fieldset>

                <fieldset className="mb-[15px] w-full flex flex-col justify-start">
                    <label className="text-[13px] leading-none mb-2.5 text-violet12 block" htmlFor="address">
                        Alamat
                    </label>
                    <textarea
                        {...register("address")}
                        placeholder="Alamat"
                        className="grow shrink-0 rounded-lg p-3 text-[13px] leading-none shadow-[0_0_0_1px] shadow-stora-200 h-[75px] focus:shadow-[0_0_0_2px] focus:shadow-stora-300 outline-none"
                        rows={4}
                    ></textarea>
                </fieldset>

                <div className="py-4">
                    <button type="submit" disabled={loadingShipping} className="w-full h-[40px] text-sm text-white rounded-lg shadow bg-stora-500">
                        {loadingShipping ? <ILoading text="Simpan" /> : "Simpan"}
                    </button>
                </div>
            </form>

            <pre>{JSON.stringify(shipping, undefined, 2)}</pre>
        </div>
    )
}