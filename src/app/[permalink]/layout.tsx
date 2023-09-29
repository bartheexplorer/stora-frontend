import OrderProvider from "@/context/order"
import AppLayout from "../components/app-layout"
import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Stora.id - Next Level Online Store & Form Order",
    default: "Stora.id - Next Level Online Store & Form Order"
  },
  description: 'Dengan Stora, Anda dapat menjalankan toko online Anda dengan cepat dan mudah. Tidak perlu repot dengan proses order yang rumit, karena Stora memberikan solusi yang efisien untuk mempercepat proses order Anda.',
}

export default function PermalinkLayout({ children }: { children: ReactNode }) {
    return (
        <OrderProvider>
            <AppLayout>
                {children}
            </AppLayout>
        </OrderProvider>
    )
}