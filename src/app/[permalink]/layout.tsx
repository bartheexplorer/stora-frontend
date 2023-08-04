import AppLayout from "../components/app-layout"
import type { ReactNode } from "react"

export default function PermalinkLayout({ children }: { children: ReactNode }) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    )
}