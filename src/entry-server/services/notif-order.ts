import { appConfig } from "../config/app"

export async function notifOrder(params: {
    user_id: string
    order_id: string
    order_status: string
    jenis_produk: string
}) {
    try {
        const requestOptions: RequestInit = {
            method: 'GET',
        }
        const url = `${appConfig.domain.storaApi}/apiv3/pesanan/autoSendKostumPesan?_key=WbsLinkV00&id_user=${params.user_id}&order_id=${params.order_id}&order_status=${params.order_status}&jenisProduk=${params.jenis_produk}`
        // console.log(url)
        const _res = await fetch(url, requestOptions)
        const _body = await _res.json()
        return _body
    } catch (error) {
        throw new Error("Gagal kirim data")
    }
}