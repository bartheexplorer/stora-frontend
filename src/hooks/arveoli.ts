import useSWR from "swr"
import useSWRMutation from "swr/mutation"
// import {
//     validateResponseProvinceArveoli,
//     validateResponseRegencyArveoli,
//     validateResponseShippingArveoli,
//     validateResponseSubDistrictArveoli,
//     validateResponseUrbanVillageArveoli,
// } from "./arveoli-schema"

// Province arveoli
const provinceFetcher = async (url: string) => {
    const result = await fetch(url, {
        method: "GET",
    })

    // return validateResponseProvinceArveoli(await result.json())
    return await result.json()
}

export function useProvinceArveoli() {
    const { data, mutate, isLoading, ...rest } = useSWR(
        `/api/order/address?type=province&reference=01`,
        provinceFetcher
    )

    return {
        data,
        sendRequest: mutate,
        isLoading,
        ...rest
    }
}

// Regency arveoli
const regencyFetcher = async (url: string, {
    arg
}: {
    arg: { provinceId: string }
}) => {
    const result = await fetch(`${url}&provinceId=${arg.provinceId}`, {
        method: 'GET',
    })

    // return validateResponseRegencyArveoli(await result.json())
    return await result.json()
}

export function useRegencyArveoli() {
    const { data, trigger, isMutating: isLoading, ...rest } = useSWRMutation(
        `/api/order/address?type=regency&reference=01`,
        regencyFetcher
    )

    return {
        data,
        sendRequest: trigger,
        isLoading,
        ...rest
    }
}

// subdistrict arveoli
const subDistrictFetcher = async (url: string, {
    arg
}: {
    arg: { regencyId: string }
}) => {
    const result = await fetch(`${url}&regencyId=${arg.regencyId}`, {
        method: 'GET',
    })

    // return validateResponseSubDistrictArveoli(await result.json())
    return await result.json()
}

export function useSubDistrictArveoli() {
    const { data, trigger, isMutating: isLoading, ...rest } = useSWRMutation(
        `/api/order/address?type=sub-district&reference=01`,
        subDistrictFetcher
    )

    return {
        data,
        sendRequest: trigger,
        isLoading,
        ...rest
    }
}

// Urban villagearveoli
const urbanVillageFetcher = async (url: string, {
    arg
}: {
    arg: { subDistrictId: string }
}) => {
    const result = await fetch(`${url}&subDistrictId=${arg.subDistrictId}`, {
        method: 'GET',
    })

    // return validateResponseUrbanVillageArveoli(await result.json())
    return await result.json()
}

export function useUrbanVillageArveoli() {
    const { data, trigger, isMutating: isLoading, ...rest } = useSWRMutation(
        `/api/order/address?type=k&reference=01`,
        urbanVillageFetcher
    )

    return {
        data,
        sendRequest: trigger,
        isLoading,
        ...rest
    }
}

// Shipping
const shippingFetcher = async (url: string, {
    arg
}: {
    arg: {
        userId: string
        destination: string
        weight: string
    }
}) => {
    const result = await fetch(
        `${url}&weight=${arg.weight}&userId=${arg.userId}&destination=${arg.destination}`,
        {
            method: 'GET',
        }
    )

    // return validateResponseShippingArveoli(await result.json())
    return await result.json()
}

export function useShippingArveoli() {
    const { data, trigger, isMutating: isLoading, ...rest } = useSWRMutation(
        `/api/order/address?type=ongkir&reference=01`,
        shippingFetcher,
    )

    return {
        data,
        sendRequest: trigger,
        isLoading,
        ...rest
    }
}
