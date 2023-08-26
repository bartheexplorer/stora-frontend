import type { PrismaClient } from "@prisma/client"

export async function getCategories(prisma:PrismaClient, permalink: string) {
    const categories =
        await prisma.t_kategori_produk.findMany({
            select: {
                _count: {
                    select: {
                        products: {
                            where: {
                                user: {
                                    setting: {
                                        OR: [
                                            { permalink: permalink },
                                            { nama_toko: permalink },
                                        ]
                                    }
                                }
                            }
                        },
                    }
                },
                kategori: true,
                id_kategori_produk: true,
            },
            where: {
                products: {
                    some: {
                        AND: [
                            {
                                user: {
                                    setting: {
                                        OR: [
                                            { permalink: { equals: permalink } },
                                            { nama_toko: { equals: permalink } },
                                        ]
                                    }
                                },
                            }
                        ],
                        is_active: { equals: 'SATU' },
                        status: { equals: 'aktif' },
                    },
                },
            },
        })
    return categories
}