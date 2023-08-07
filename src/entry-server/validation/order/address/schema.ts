import { z } from "zod"

export const AddressTypeRequestSchema = z.object({
    type: z.string().min(1),
    reference: z.string().min(1),
})

export const RegecyArveoliRequestSchema = z.object({
    provinceId: z.string().min(1),
})

export const SubDistrictArveoliRequestSchema = z.object({
    regencyId: z.string().min(1),
})

export const UrbanVillageArveoliRequestSchema = z.object({
    subDistrictId: z.string().min(1),
})

export const OngkirArveoliRequestSchema = z.object({
    userId: z.string().min(1),
    weight: z.string().min(1),
    destination: z.string().min(1),
})

export const OngkirRajaongkirRequestSchema = z.object({
    origin: z.string().min(1),
    originType: z.string().min(1),
    destination: z.string().min(1),
    destinationType: z.string().min(1),
    weight: z.string().min(1),
    courier: z.string().min(1),
})
