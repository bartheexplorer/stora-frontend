import { z } from "zod"

export const IFormValueCouponSchema = z.object({
    kode_coupon: z.string().min(2),
})

export type IFormValueCoupon = z.infer<typeof IFormValueCouponSchema>
