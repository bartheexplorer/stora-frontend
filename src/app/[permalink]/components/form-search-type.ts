import { z } from "zod"

export const SearchSchema = z.object({
    q: z.string(),
})

export type IFormSearch = z.infer<typeof SearchSchema>
