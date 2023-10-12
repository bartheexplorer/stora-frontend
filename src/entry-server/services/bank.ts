import { PrismaClient } from "@prisma/client";

export async function findBankByNorek(prisma: PrismaClient, params: {
    rekening: string
    id_user: number
}) {
    return await prisma.t_bank.findFirst({
        where: {
            rekening: params.rekening,
            id_user: params.id_user,
        },
    })
}