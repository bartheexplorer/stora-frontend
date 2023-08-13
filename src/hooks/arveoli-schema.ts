import { z } from "zod"

// province arveoli
export const ProvinceArveoliSchema = z.object({
    data: z.object({
        province: z.object({
            name: z.string(),
        }).array(),
    }).nullable(),
})

export type ProvinceArveoli = z.infer<typeof ProvinceArveoliSchema>

export function validateResponseProvinceArveoli(input: unknown) {
    return ProvinceArveoliSchema.parse(input)
}

// regency arveoli
export const RegencyArveoliSchema = z.object({
    data: z.object({
        city: z.object({
            name: z.string(),
        }).array(),
    }).nullable(),
})

export type RegencyArveoli = z.infer<typeof RegencyArveoliSchema>

export function validateResponseRegencyArveoli(input: unknown) {
    return RegencyArveoliSchema.parse(input)
}

// subdistrict arveoli
export const SubDistrictArveoliSchema = z.object({
    data: z.object({
        district: z.object({
            name: z.string(),
        }).array(),
    }).nullable(),
})

export type SubDistrictArveoli = z.infer<typeof SubDistrictArveoliSchema>

export function validateResponseSubDistrictArveoli(input: unknown) {
    return SubDistrictArveoliSchema.parse(input)
}

// urban veillage
export const UrbanVillageArveoliSchema = z.object({
    data: z.object({
        sub_district: z.object({
            id_mapping: z.number().min(1)
                .or(z.string().min(1)),
            name: z.string(),
            zip_code: z.string(),
            dest_code_jne: z.string(),
            dest_code_sicepat: z.string(),
            dest_code_sap: z.string(),
            dest_code_idx: z.string()
        }).array(),
    }).nullable(),
})

export type UrbanVillageArveoli = z.infer<typeof UrbanVillageArveoliSchema>

export function validateResponseUrbanVillageArveoli(input: unknown) {
    return UrbanVillageArveoliSchema.parse(input)
}

// Shipping
const Data = z.object({
    service_code: z.string(), // "JTR23",
    service_name: z.string(), // "JTR",
    price: z.string()
        .or(z.number()), // "13500000",
    etd: z.string().nullable().optional(), // "30 - null hari",
    discount_price: z.string()
        .or(z.number()), // 13162500,
    cashless_discount_price: z.string()
        .or(z.number()), // 13500000
})

export const ShippingArveoliSchema = z.object({
    data: z.object({
        data: z.object({
            jne: z.array(Data),
            sap: z.array(Data),
            sicepat: z.array(Data),
            idx: z.array(Data),
        }),
    }),
})

export type ShippingArveoli = z.infer<typeof ShippingArveoliSchema>

export function validateResponseShippingArveoli(input: unknown) {
    return ShippingArveoliSchema.parse(input)
}

