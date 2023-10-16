import { prisma } from "@/entry-server/config/db";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

async function _kurir(prisma: PrismaClient, userId: number) {
    return await prisma.t_kurir_lokal.findFirst({
        where: {
            id_user: userId,
        },
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.query?.id
    console.log(userId)
    const _data = await _kurir(prisma, Number(userId))
    if (!_data) return res.json({ data: null })

    if (_data.is_active !== "SATU") return res.json({ data: null })
    
    return res.json({
        data: {
            ..._data,
            key: "Lokal",
        },
    })
}