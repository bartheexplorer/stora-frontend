import useSWR from "swr"

const fetcher = async (url: RequestInfo) => {
    const res = await fetch(url)
    const _body = await res.json()
    return _body
}

export function useCarts() {
    const {
        data,
        isLoading,
        mutate: sendRequest,
        ...rest
    } = useSWR("/api/cart?user_id=16&cart_id=7473139449741111", fetcher)

    return {
        data,
        isLoading,
        sendRequest,
        ...rest,
    }
}