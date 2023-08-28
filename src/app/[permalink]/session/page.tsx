import { prisma } from "@/entry-server/config/db"
import { getUser } from "@/entry-server/services/user"
import dynamic from "next/dynamic"

const DynamicSessioncontent = dynamic(() => import("./_components/session.content"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#623C98] from-10% via-[#623C98] via-30% to-[#5D3891]/80 to-90%">
            <svg className="animate-spin h-12 w-12 text-slate-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    )
})

interface SessionProps {
    params: {
        permalink: string
        page?: string
    }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Session(props: SessionProps) {
    const permalink = props.params.permalink

    const _slugToTitle = (slug: string): string => {
        const words = slug.split('-'); // Split the slug into words using dashes
        const titleWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize each word

        return titleWords.join(' '); // Join the words back together with spaces
    }

    const _permak_link = _slugToTitle(permalink)

    const user = await getUser(prisma, _permak_link)

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#623C98] from-10% via-[#623C98] via-30% to-[#5D3891]/80 to-90%">
                <h3 className="text-white text-sm font-medium tracking-wide">User tidak ditemukan</h3>
            </div>
        )
    }

    return <DynamicSessioncontent permalink={_permak_link} />
}
