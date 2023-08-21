import useSWR from "swr"
import type { PhotoProduct } from "./product-schema"

const fetcher = async (url: RequestInfo) => {
    const headers = new Headers()
    headers.append("Accept", "application/json")
    const result = await fetch(url, { method: "GET" })
    if (!result.ok) return null
    return await result.json() as PhotoProduct
}

export function usePhotoProduct(fileName: string, userId: string) {
    const {
        data,
        isLoading,
        mutate: sendRequest,
        error,
        ...rest
    } = useSWR(
        `/api/product/image?file_name=${fileName}&user_id=${userId}`,
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
