import useSWR from "swr"

type KurirType = {
    data: {
        id_kurir_lokal: number // 11,
        kurir_lokal: string // "Kurir Lokal",
        ongkir: number // 25000,
        is_active: string // "SATU",
        id_user: number // 16,
        key: string // "lokal"
    } | null
}

const fetchKurir = async (url: string) => {
    const _res = await fetch(url, {
        method: "GET",
    })
    const _body = await _res.json()
    return _body as KurirType
}

export function useKurir(userId: string) {
    const {
        data,
        isLoading,
        mutate: sendReq,
        ...rest
    } = useSWR(
        `/api/kurir?id=${userId}`,
        fetchKurir
    )

    return {
        data,
        isLoading,
        sendReq,
        ...rest,
    }
}