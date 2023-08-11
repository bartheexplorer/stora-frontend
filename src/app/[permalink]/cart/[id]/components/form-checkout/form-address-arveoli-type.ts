import { z } from "zod"

export const IFormValueAddressArveoliSchema = z.object({
    province: z.string().min(1),
    regency: z.string().min(1),
    subDistrict: z.string().min(1),
    urbanVillage: z.string().min(1),
    address: z.string().min(1),
    kodepos: z.string().min(1),
})

export type IFormValueAddressArveoli = z.infer<typeof IFormValueAddressArveoliSchema>

