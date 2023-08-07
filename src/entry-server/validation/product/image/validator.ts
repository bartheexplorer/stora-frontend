import { PhotoProductRequestSchema } from "./schema"

export function validatePhotoProductRequest(input: unknown) {
    return PhotoProductRequestSchema.parse(input)
}
