import { z } from "zod"

export const PhotoProductSchema = z.object({
    data: z.object({
        data: z.string(),
        data1: z.string(),
    }),
})

export type PhotoProduct = z.infer<typeof PhotoProductSchema>

export function validateResponsePhotoProduct(input: unknown) {
    return PhotoProductSchema.parse(input)
}
