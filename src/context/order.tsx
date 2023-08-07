"use client"

import type { ShippingArveoli } from "@/hooks/arveoli-schema"
import React, { createContext, useState } from "react"

interface State {
    shippingArveoli: ShippingArveoli["data"] | null
}

interface OrderState extends State {
    setOrderState: React.Dispatch<React.SetStateAction<State>>;
}

export const OrderContext = createContext<OrderState>({
    shippingArveoli: null,
    setOrderState: () => { },
})

export const toShipping = (options: ShippingArveoli["data"]["data"]) => {
    for (const [key, array] of Object.entries(options)) {
        if (Array.isArray(array) && array.length > 0) {
            return {
                ...array[0],
                s_name: key as keyof ShippingArveoli["data"]["data"], // Type safety maintained without explicit type assertion
            }
        }
    }

    return null
}

export default function OrderProvider({ children }: { children: React.ReactNode }) {
    const [orderState, setOrderState] = useState<State>({
        shippingArveoli: null,
    })

    return (
        <OrderContext.Provider
            value={{
                ...orderState,
                setOrderState,
            }}
        >
            {children}
        </OrderContext.Provider>
    )
}
