import { getPhotoProduct2 } from "@/entry-server/services/product"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { file_name, user_id } = req.query
    if (!file_name || !user_id || typeof file_name !== "string" || typeof user_id !== "string") {
        return res.status(400)
            .json({
                error: "Something error",
            })
    }
    const fileName = file_name.trim()
        .split(',')
        .find((_item, index) => index === 0)

    if (!fileName) {
        return res.status(400)
            .json({ error: "Data tidak ditemukan" })
    }

    const result = await getPhotoProduct2(file_name, user_id)
    if (!result) {
        return res.status(400)
            .json({ error: "Data tidak ditemukan" })
    }

    return res.json({
        data: result,
    })
}
