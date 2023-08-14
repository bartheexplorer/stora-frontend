import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405)
            .json({ message: "Method not allowed" })
    }

    const body = JSON.parse(req.body)
    console.log(body)

    return res.json({
        data: body,
    })
}