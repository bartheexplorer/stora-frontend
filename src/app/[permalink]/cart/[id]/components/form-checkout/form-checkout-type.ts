import { z } from "zod"

export const IFormValueCheckoutSchema = z.object({
    nama_lengkap: z.string().min(1),
    nomor_whatsapp: z.string().min(1),
    payment: z.object({
        id: z.string(),
        bank: z.string().optional(),
        account: z.string().optional(),
        name: z.string().optional(),
        payment_method: z.string(),
    }).optional(),
})

export type IFormValueCheckout = z.infer<typeof IFormValueCheckoutSchema>