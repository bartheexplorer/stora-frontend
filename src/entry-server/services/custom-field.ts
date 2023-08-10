import type { PrismaClient } from "@prisma/client"
import type { CustomField } from "./product-interface"

export async function getCustomFieldById(prisma: PrismaClient, id_custom_field: string) {
    try {
        const results = await prisma.$queryRaw<CustomField[]>`
        SELECT
          t_custom_field.id_custom_field,
          t_custom_field.field,
          t_custom_field.type,
          t_custom_field.required,
          t_custom_field.label,
          t_custom_field.placeholder,
          t_custom_field.is_option,
          t_custom_field.idx
        FROM t_custom_field
        WHERE t_custom_field.id_custom_field = ${id_custom_field}
        LIMIT 1 OFFSET 0
      `

        const [data] = results.filter((_item, index) => (index === 0))
        if (!data) return null
        return data
    } catch (error) {
        return null
    }
}