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