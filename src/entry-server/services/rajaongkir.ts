import { appConfig } from "../config/app"

export async function getProvinceRajaongkir() {
    const { appKey, apiUrl } = appConfig.rajaOngkir

    try {
        const headers = new Headers()
        headers.append("key", appKey)

        const result = await fetch(
            `${apiUrl}/api/province`,
            {
                headers,
                method: "GET",
            }
        )
        if (!result.ok) throw new Error("Error")

        return await result.json()
    } catch (error) {
        return null
    }
}

export async function getRegencyRajaongkir(provinceId: string) {
    const { appKey, apiUrl } = appConfig.rajaOngkir

    try {
        const headers = new Headers()
        headers.append("key", appKey)

        const result = await fetch(
            `${apiUrl}/api/city?province=${provinceId}`,
            {
                headers,
                method: "GET",
            }
        )
        if (!result.ok) throw new Error("Error")
        return await result.json()
    } catch (error) {
        return null
    }
}

export async function getSubDistrictRajaongkir(regencyId: string) {
    const { appKey, apiUrl } = appConfig.rajaOngkir

    try {
        const headers = new Headers()
        headers.append("key", appKey)

        const result = await fetch(
            `${apiUrl}/api/subdistrict?city=${regencyId}`,
            {
                headers,
                method: "GET",
            }
        )

        if (!result.ok) throw new Error("Error")
        return await result.json()
    } catch (error) {
        return null
    }
}

export async function getOngkirRajaongkir({
    origin,
    originType,
    destination,
    destinationType,
    weight,
    courier,
}: {
    origin: string
    originType: string
    destination: string
    destinationType: string
    weight: string
    courier: string
}) {
    const { appKey, apiUrl } = appConfig.rajaOngkir

    try {
        const headers = new Headers()
        headers.append("key", appKey)
        headers.append("Content-Type", "application/x-www-form-urlencoded")

        const urlencoded = new URLSearchParams()
        urlencoded.append("origin", origin)
        urlencoded.append("originType", originType)
        urlencoded.append("destination", destination)
        urlencoded.append("destinationType", destinationType)
        urlencoded.append("weight", weight)
        urlencoded.append("courier", courier)

        const result = await fetch(
            `${apiUrl}/api/cost`,
            {
                headers,
                body: urlencoded,
                method: "POST",
            }
        )

        if (!result.ok) throw new Error("Data tidak ditemukan")
        return await result.json()
    } catch (error) {
        return null
    }
}
