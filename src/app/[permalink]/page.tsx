import { prisma } from "@/entry-server/config/db"
import { getProductWithPaginate } from "@/entry-server/services/product"
import { getUser } from "@/entry-server/services/user"
import { createPaginator } from "prisma-pagination"

interface PermalinkProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Permalink(props: PermalinkProps) {
    const categoryProductId = !isNaN(Number(props.searchParams?.id_category?.toString()))
        ? Number(props.searchParams?.id_category?.toString())
        : null

    const user = await getUser(prisma, props.params.permalink)
    const products = await getProductWithPaginate(prisma, {
        permalink: props.params.permalink,
        page: !isNaN(Number(props.searchParams?.page))
            ? Number(props.searchParams.page)
            : 0,
        sort: props.searchParams?.sort?.toString(),
        search: props.searchParams?.q?.toString(),
        ...(categoryProductId ? { categoryProductId } : {})
        
    })

    return (
        <div>
            <p>Permalink</p>
            <pre>{JSON.stringify(products, undefined, 2)}</pre>
        </div>
    )
}