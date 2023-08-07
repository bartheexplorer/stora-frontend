import { z } from "zod"

export const PhotoProductRequestSchema = z.object({
    fileName: z.string().min(1),
    userId: z.string().min(1),
})
