import { z } from "zod"

export const IFormValueQtySchema = z.object({
    qty: z.string(),
})

export type IFormValueQty = z.infer<typeof IFormValueQtySchema>