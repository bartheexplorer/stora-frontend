import { appConfig } from "../config/app"

/**
 * Get all province
 * @returns province
 */
export async function getProvinceArveoli_wbslink() {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv3/destination/getProvinsi?_key=WbslinkV00`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw Error("Error jaringan")

        return await result.json()
    } catch (error) {
        return null
    }
}

/**
 * Get regency
 * @param provinceId string
 * @returns regency id
 */
export async function getRegencyArveoli_wbslink(provinceId: string) {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv3/destination/getCity?_key=WbslinkV00&province=${provinceId}`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw new Error("Error jaringan")

        return await result.json()
    } catch (error) {
        return null
    }
}

/**
 * Get sub district
 * @param regencyId string
 * @returns sub district
 */
export async function getSubDistrictArveoli_wbslink(regencyId: string) {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv3/destination/getDistrict?_key=WbslinkV00&city=${regencyId}`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw new Error("Error jaringan")

        return await result.json()
    } catch (error) {
        return null
    }
}

/**
 * get Urban village
 * @param subDistrictId string
 * @returns urban village
 */
export async function getUrbanVillageArveoli_wbslink(subDistrictId: string) {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv3/destination/getSubDistrict?_key=WbslinkV00&district=${subDistrictId}`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw Error("Error jaringan")

        return await result.json()
    } catch (error) {
        return null
    }
}

/**
 * Get ongkir
 * @param param0 object
 * @returns ongkir
 */
export async function getOngkirArveoli_wbslink({
    userId,
    weight,
    destination,
}: {
    userId: string
    weight: string
    destination: string
}) {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv3/checkout/cekOngkir?_key=WbslinkV00&idUser=${userId}&destination=${destination}&berat=${weight}`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw new Error("Error jaringan")
        return await result.json();
    } catch (error) {
        return null
    }
}
