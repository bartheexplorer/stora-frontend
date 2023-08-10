import { z } from "zod"

export const IFormValueCheckoutSchema = z.object({
    is_cart: z.string().optional(),
    nama_lengkap: z.string().min(1),
    nomor_whatsapp: z.string().min(1),
    jumlah: z.string().min(1),
    custom_fields: z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
        field: z.string(),
        required: z.boolean(),
        placeholder: z.string(),
        options: z.object({
            id: z.string(),
            value: z.string(),
        }).array()
    }).array(),
    variasi: z.string().optional(),
    ukuran: z.string().optional(),
    payment: z.object({
        id: z.string(),
        bank: z.string().optional(),
        account: z.string().optional(),
        name: z.string().optional(),
        payment_method: z.string(),
    }).optional(),
})

export type IFormValueCheckout = z.infer<typeof IFormValueCheckoutSchema>
