import useSWR from "swr"

const fetcher = async (url: RequestInfo) => {
    const res = await fetch(url)
    const _body = await res.json()
    return _body
}

export function useCarts(user_id: string, cart_id?: string) {
    const {
        data,
        isLoading,
        mutate: sendRequest,
        ...rest
    } = useSWR(`/api/cart?user_id=${user_id}&cart_id=${cart_id}`, fetcher)

    return {
        data,
        isLoading,
        sendRequest,
        ...rest,
    }
}