import type { Prisma, PrismaClient } from "@prisma/client"
import type { CustomField, Options, Product, ProductDetail, TCountdown } from "./product-interface"
import { createPaginator } from "prisma-pagination"
import { appConfig } from "../config/app"

const paginate = createPaginator({ perPage: 50 })

export async function getProducts(prisma: PrismaClient, userId?: number) {
    if (!userId) return []
    return await prisma.t_produk.findMany({
        where: {
            id_user: { equals: userId }
        },
        take: 50,
    })
}

export async function getProductWithPaginate(
    prisma: PrismaClient,
    params: {
        permalink: string
        search?: string
        page?: number
        sort?: string
        categoryProductId?: number
        perPage?: number
    }
) {
    const whereSearch: Prisma.t_produkWhereInput | undefined = params?.search
        ? {
            OR: [
                { nama_produk: { contains: params.search } },
                { jenis_produk: { contains: params.search } },
            ],
        }
        : undefined;

    return await paginate<Product, Prisma.t_produkFindManyArgs>(
        prisma.t_produk,
        {
            where: {
                AND: [
                    {
                        user: {
                            setting: {
                                OR: [
                                    { permalink: { equals: params?.permalink } },
                                    { nama_toko: { equals: params?.permalink } },
                                ],
                            }
                        },
                    },
                ],
                is_active: { equals: 'SATU' },
                status: { equals: 'aktif' },
                id_kategori_produk: { equals: params?.categoryProductId },
                ...whereSearch,
            },
            include: {
                category: true,
                views: true,
                variantions: true,
                sizes: true,
                user: {
                    select: {
                        setting: {
                            select: {
                                permalink: true,
                                nama_toko: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id_produk: params?.sort === 'terbaru' ? 'asc' : 'desc',
            },
        },
        {
            page: params?.page,
            perPage: params?.perPage,
        }
    )
}

export async function getProduct(
    prisma: PrismaClient,
    params: {
        permalink: string
        productId: number
    }
) {
    try {
        const resultTrx = await prisma.$transaction(async (tx) => {
            const product = await tx.t_produk.findFirst({
                where: {
                    AND: [
                        {
                            user: {
                                setting: {
                                    OR: [
                                        { permalink: { equals: params.permalink } },
                                        { nama_toko: { equals: params.permalink } },
                                    ],
                                },
                            },
                        }
                    ],
                    is_active: { equals: 'SATU' },
                    status: { equals: 'aktif' },
                    id_produk: { equals: params.productId }
                },
                include: {
                    benefits: true,
                    category: true,
                    views: true,
                    variantions: true,
                    sizes: true,
                    user: {
                        select: {
                            setting: {
                                select: {
                                    permalink: true,
                                    nama_toko: true,
                                },
                            },
                        },
                    },
                },
            })

            if (!product) throw new Error('Tidak ada produk')

            const likeProductId = `%${product.id_produk}%`
            const permalinks = params?.permalink

            const customField = await tx.$queryRaw<CustomField[]>`SELECT
            t_custom_field.id_custom_field,
            t_custom_field.field,
            t_custom_field.type,
            t_custom_field.required,
            t_custom_field.label,
            t_custom_field.placeholder,
            t_custom_field.is_option,
            t_custom_field.idx
          FROM t_custom_field
          WHERE
            (
              (t_custom_field.id_user) IN (
                SELECT t0.id_user FROM t_user AS t0
                INNER JOIN t_setting AS j0 ON (j0.id_user = t0.id_user)
                WHERE (j0.nama_toko = ${permalinks} OR j0.permalink = ${permalinks})
              )
            )
          AND t_custom_field.id_produk LIKE ${likeProductId}
          AND t_custom_field.id_custom_field IS NOT NULL
          ORDER BY t_custom_field.idx ASC
          LIMIT 100 OFFSET 0`

            const customFields = []
            for (const item of customField) {
                const idCustomField = item.id_custom_field
                const opt = await prisma.$queryRaw<Options[]>`SELECT
            t_option.value,
            t_option.id_option
            FROM t_option
            WHERE (
                (t_option.id_custom_field) IN (
                  SELECT t0.id_custom_field FROM t_custom_field AS t0 WHERE t0.id_custom_field = ${idCustomField}
                )
              )
            AND t_option.id_option IS NOT NULL
            `
                customFields.push({
                    ...item,
                    options: opt,
                })
            }

            const countText = await tx.$queryRaw<TCountdown[]>`
          SELECT
            t_countdown.id_countdown,
            t_countdown.teks_countdown,
            t_countdown.id_produk,
            t_countdown.id_user
          FROM t_countdown
          WHERE
            (
              (t_countdown.id_user) IN (
                SELECT t0.id_user FROM t_user AS t0
                INNER JOIN t_setting AS j0 ON (j0.id_user = t0.id_user)
                WHERE (j0.nama_toko = ${permalinks} OR j0.permalink = ${permalinks})
              )
            )
          AND t_countdown.id_produk LIKE ${likeProductId}
          AND t_countdown.id_countdown IS NOT NULL
          LIMIT 1 OFFSET 0`

            const [dataCountText] = countText.filter((_item, index) => index === 0)

            return {
                customFields,
                countText: dataCountText ? dataCountText : null,
                ...product,
            } as ProductDetail
        })

        return resultTrx
    } catch {
        return null
    }
}

// get photo produk1
export async function getPhotoProduct2(fileName: string, userId: string) {
    const url = `${appConfig.domain.storaAssets}/assets/image/produk/${userId}/${fileName}`
    console.log("2", url)
    const result = await fetch(url, {
        method: "GET"
    })
    if (!result.ok) return await getPhotoProduct1(fileName)

    return {
        data: url,
        data1: `/assets/image/produk/${userId}/${fileName}`,
    }
}

// get photo produk2
export async function getPhotoProduct1(fileName: string) {
    try {
        const url = `${appConfig.domain.storaAssets}/assets/image/produk/${fileName}`
        console.log("1", url)
        const result = await fetch(url, {
            method: "GET",
        })
        if (!result.ok) throw new Error("Data tidak ditemukan")

        return {
            data: url,
            data1: `/assets/image/produk/${fileName}`,
        }
    } catch (error) {
        return null
    }
}