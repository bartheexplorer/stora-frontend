"use client"

import { useCarts } from "../use-carts"

interface CartCounterProps {
    userId: string
    cartId?: string
}

export default function CartCounter(props: CartCounterProps) {
    const {
        data: cartsResponse,
    } = useCarts(props.userId, props?.cartId)

    const _carts = cartsResponse?.carts

    let _count: number = 0
    if (_carts && (Array.isArray(_carts) && _carts.length > 0)) {
        _count = _carts.reduce((sum, item) => (sum + parseInt(item.qty)), 0)
    }

    return (
        <>
            {((Array.isArray(_carts) && _carts.length > 0)) ? (
                <div className="absolute -top-1 -left-3 bg-gray-500 rounded-full text-[9px] w-4 h-4 leading-3 text-gray-100 flex items-center justify-center">
                    {_count}
                </div>
            ) : null}
        </>
    )
}