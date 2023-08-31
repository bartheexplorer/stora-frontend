import useSWR from "swr"

const fetcher = async (url: RequestInfo) => {
    const res = await fetch(url)
    const _body = await res.json()
    return _body?.data
}

export function useSession(permalink: string) {
    const {
        data,
        isLoading,
        mutate: sendRequest,
        ...rest
    } = useSWR(`/${permalink}/session/api/session`, fetcher, {
        refreshInterval: 3000,
    })

    return {
        data,
        isLoading,
        sendRequest,
        ...rest,
    }
}