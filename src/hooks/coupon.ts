import useSWRMutation from "swr/mutation"

const fetcher = async (url: RequestInfo, { arg }: {
    arg: {
        permalink: string
        product_id: string
        coupon: string
    },
}) => {
    const headers = new Headers()
    headers.append("Accept", "application/json")

    const result = await fetch(
        `${url}?product_id=${arg.product_id}&permalink=${arg.permalink}&coupon=${arg.coupon}`,
        { method: "GET" }
    )
    return await result.json()
}

export function useCoupon() {
    const {
        data,
        isMutating: isLoading,
        trigger: sendRequest,
        error,
        ...rest
    } = useSWRMutation(
        `/api/coupon`,
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