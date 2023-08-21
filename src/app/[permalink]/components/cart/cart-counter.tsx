"use client"

import { useCarts } from "../use-carts"

export default function CartCounter() {
    const {
        data: cartsResponse,
        isLoading,
    } = useCarts()

    if (isLoading) return null 

    const _carts = cartsResponse?.carts
    return (
        <>
            {((Array.isArray(_carts) && _carts.length > 0)) ? (

                <div className="absolute -top-1 -left-3 bg-gray-500 rounded-full text-[9px] w-4 h-4 leading-3 text-gray-100 flex items-center justify-center">
                    {_carts.length}
                </div>
            ) : null}
        </>
    )
}