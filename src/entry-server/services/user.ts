import type { PrismaClient, t_setting_fitur } from "@prisma/client"
import type { Features } from "./user-interface"
import { appConfig } from "../config/app"

export async function cekMembership(
    memberId: string,
    productId: string
) {
    try {
        const result = await fetch(
            `${appConfig.domain.storaApi}/apiv2/user/getExpiredNew?_key=WbsLinkV00&user_id=${memberId}&product_id=${productId}`,
            {
                method: 'GET',
            }
        )

        if (!result.ok) throw new Error("Error jaringan")
        return Boolean((await result.text()) === "1")
    } catch {
        return false
    }
}

export async function getUser(prisma: PrismaClient, permalink: string) {
    const user = await prisma.t_user.findFirst({
        where: {
            setting: {
                OR: [
                    { permalink: { equals: permalink } },
                    { nama_toko: { equals: permalink } },
                ],
            },
        },
        include: {
            setting: true,
            pickups: true,
            banks: {
                where: {
                    is_active: { equals: "SATU" },
                },
            },
            xendits: {
                where: {
                    is_active: { equals: "SATU" },
                    is_blocked: { equals: "NOL" },
                },
            },
            xendits_va: {
                where: {
                    is_active: { equals: "SATU" },
                },
            },
        },
    })

    if (!user) return null

    const membership = await cekMembership(
        user.user_id.toString(),
        user.produk_id.toString()
    )

    return { ...user, membership }
}

export async function findFeatureUser(prisma: PrismaClient, params: { userId: string }) {
    try {
        const [features] = await prisma.$transaction([
            prisma.$queryRaw<Features[]>`SELECT v_fittur.id_fittur,
            v_fittur.fittur,
            v_fittur.harga,
            v_fittur.status
          FROM v_fittur
          WHERE (v_fittur.id_user) IN (
            SELECT t0.id_user
            FROM v_fittur AS t0
            INNER JOIN t_user AS j0 ON (j0.id_user = t0.id_user)
            WHERE (j0.id_user = ${params.userId} AND t0.id_fittur IS NOT NULL)
          )
          LIMIT 1 OFFSET 0`
        ])
        const [item] = features.filter((_item, i) => (i === 0))
        return item ? item : null
    } catch (error) {
        return null
    }
}


export async function findSettingFeature(
    prisma: PrismaClient,
    params: { id: t_setting_fitur['id_setting_fitur'] }
) {
    try {
        const settings = await prisma.t_setting_fitur.findUniqueOrThrow({
            where: {
                id_setting_fitur: params.id,
            },
        })
        return settings
    } catch (error) {
        return null
    }
}
