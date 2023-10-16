import {
    getOngkirArveoli_wbslink,
    getProvinceArveoli_wbslink,
    getRegencyArveoli_wbslink,
    getSubDistrictArveoli_wbslink,
    getUrbanVillageArveoli_wbslink,
} from "@/entry-server/services/arveoli";
import {
    getOngkirRajaongkir,
    getProvinceRajaongkir,
    getRegencyRajaongkir,
    getSubDistrictRajaongkir,
} from "@/entry-server/services/rajaongkir";
import {
    validateAddressTypeRequest,
    validateOngkirArveoliRequest,
    validateOngkirRajaongkirRequest,
    validateRegecyArveoliRequest,
    validateSubDistrictArveoliRequest,
    validateUrbanVillageArveoliRequest,
} from "@/entry-server/validation/order/address/validator";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Handle get address from arveoli or rajaongkir api
 * @param request NextApiRequest
 * @param response NextApiResponse
 * @returns json
 */
export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Method not allowed' })
    }

    try {
        /**
         * Method get
         * Params type, reference
         * Type = province | regency | sub-district | urban village (k = kelurahan) | ongkir
         * Reference = arveoli 01 | rajaongkir 02
         */
        const { type, reference } = validateAddressTypeRequest(request.query)

        if (type === 'ongkir') {
            if (reference === '01') {
                const body = validateOngkirArveoliRequest(request.query)
                return response.json({
                    data: await getOngkirArveoli_wbslink(body),
                })
            }

            const body = validateOngkirRajaongkirRequest(request.query)
            const data = getOngkirRajaongkir(body)
            return response.json({ data })
        }

        /**
         * Get province
         */
        if (type === 'province') {
            if (reference === '01') {
                const data = await getProvinceArveoli_wbslink()
                return response.json({ data })
            }

            const data = await getProvinceRajaongkir()
            return response.json({ data })
        }

        /**
         * Get regency
         */
        if (type === 'regency') {
            const { provinceId } = validateRegecyArveoliRequest(request.query)
            if (reference === '01') {
                const data = await getRegencyArveoli_wbslink(provinceId)
                return response.json({ data })
            }

            const data = await getRegencyRajaongkir(provinceId)
            return response.json({ data })
        }

        /**
         * Get sub district
         */
        if (type === 'sub-district') {
            const { regencyId } = validateSubDistrictArveoliRequest(request.query)
            if (reference === '01') {
                const data = await getSubDistrictArveoli_wbslink(regencyId)
                return response.json({ data })
            }

            const data = await getSubDistrictRajaongkir(regencyId)
            return response.json({ data })
        }

        /**
         * Get urban village
         * kelurahan = k
         */
        if (type === 'k') {
            if (reference === '01') {
                const { subDistrictId } = validateUrbanVillageArveoliRequest(request.query)
                const data = await getUrbanVillageArveoli_wbslink(subDistrictId)
                return response.json({ data })
            }

            return response.json({
                data: [],
            })
        }

        return response.json({
            data: []
        })
    } catch (error) {
        return response.json({ data: [] })
    }
}
