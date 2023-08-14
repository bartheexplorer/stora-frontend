import { useState } from "react"
import useSWRMutation from "swr/mutation"

const fetcher = async (url: RequestInfo, { arg }: {
    arg: any,
}) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    headers.append("Accept", "application/json")

    const result = await fetch(
        url,
        { method: "POST", body: JSON.stringify(arg) }
    )
    return await result.json()
}

export function useCreateCart() {
    const {
        data,
        isMutating: isLoading,
        trigger: sendRequest,
        error,
        ...rest
    } = useSWRMutation(
        `/api/cart/create`,
        fetcher
    )

    return {
        data,
        isLoading,
        sendRequest,
        error,
        ...rest,
    }
}

// Update
const updateFetcher = async (url: RequestInfo, { arg }: {
    arg: {
        qty: string
        cartId: string
    },
}) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    headers.append("Accept", "application/json")

    const result = await fetch(
        url,
        { method: "PUT", body: JSON.stringify(arg) }
    )
    return await result.json()
}

export function useUpdateCreateCart() {
    const {
        data,
        isMutating: isLoading,
        trigger: sendRequest,
        error,
        ...rest
    } = useSWRMutation(
        `/api/cart/update`,
        updateFetcher
    )

    return {
        data,
        isLoading,
        sendRequest,
        error,
        ...rest,
    }
}

// Delete cart
export function useDestroyCartById() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState<string | null>(null)

    const destroyData = async (cartId: string) => {
        setIsLoading(true)
        setData(null)
        setError(null)

        try {
            // Perform the actual API request to delete the data with the given id
            await fetch(`/api/cart/remove-cart?cart_id=${cartId}`, { method: 'DELETE' });
            setData("OK")
            setIsLoading(false)
        } catch (error: any) {
            setData(null)
            setIsLoading(false)
            setError(error.response.data.errorMessage)
        }
    };

    return {
        data,
        error,
        isLoading,
        sendRequest: destroyData,
    }
}

// order
const orderFetcher = async (url: RequestInfo, { arg }: {
    arg: any,
}) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    headers.append("Accept", "application/json")

    const result = await fetch(
        url,
        { method: "POST", body: JSON.stringify(arg) }
    )
    return await result.json()
}

export function useCreateOrderCart() {
    const {
        data,
        isMutating: isLoading,
        trigger: sendRequest,
        error,
        ...rest
    } = useSWRMutation(
        `/api/cart/order`,
        orderFetcher
    )

    return {
        data,
        isLoading,
        sendRequest,
        error,
        ...rest,
    }
}