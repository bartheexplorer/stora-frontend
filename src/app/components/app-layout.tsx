import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative w-full bg-white shadow overflow-hidden max-w-full md:max-w-lg mx-auto">
            {children}
        </main>
    )
}
