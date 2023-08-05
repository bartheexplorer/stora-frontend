import { z } from "zod"

export const IFormValueCheckoutSchema = z.object({
    nama_lengkap: z.string().min(1),
    nomor_whatsapp: z.string().min(1),
    jumlah: z.string().min(1),
    custom_fields: z.object({
        label: z.string(),
        value: z.string(),
        field: z.string(),
        required: z.boolean(),
        placeholder: z.string(),
        options: z.object({
            id: z.string(),
            value: z.string(),
        }).array()
    }).array()
})

export type IFormValueCheckout = z.infer<typeof IFormValueCheckoutSchema>
