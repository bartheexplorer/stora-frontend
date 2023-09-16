"use client"

import { useForm } from "react-hook-form"
import { type IFormValueQty } from "./form-qty-type"
import { useUpdateCreateCart } from "@/hooks/cart"
import { useRouter } from "next/navigation"
import ILoading from "./loading"

interface IFormQtyProps {
    cartId: string
    qty: string
}

export default function IFormQty(props: IFormQtyProps) {
    const router = useRouter()
    const {
        sendRequest: updateCart, 
        isLoading: loadingUpdate,
    } = useUpdateCreateCart()
    const {
        register,
        handleSubmit,
    } = useForm<IFormValueQty>({
        defaultValues: {
            qty: props.qty,
        },
    })

    const onHandleSubmit = handleSubmit((data) => {
        console.log(data)
    })

    // const num = (length: number = 50) => {
    //     const array: number[] = []
    //     for (let index = 1; index <= length; index++) {
    //         array.push(index);

    //     }

    //     return array.map((item) => (<option key={item} value={item}>{item}</option>))
    // }

    return (
        <div className="relative">
            <form onSubmit={onHandleSubmit}>
                <input
                    {...register("qty")}
                    className="focus:outline-none py-2 shadow px-3 rounded-lg w-14"
                    onChange={async (event) => {
                        const _val = event.target.value
                        let qty = !Number.isNaN(parseInt(_val))
                            ? Number(_val)
                            : 0
                        if (Number.isNaN(qty)) {
                            qty = 0
                        }

                        if (qty <= 0) {
                            event.target.value = "1"
                            qty = 1
                        }

                        if (qty >= 1000) {
                            event.target.value = "1000"
                            qty = 1000
                        }

                        await updateCart({
                            qty: qty.toString(),
                            cartId: props.cartId,
                        })
                        router.refresh()
                    }}
                />
            </form>
            {loadingUpdate && (
                <div className="absolute inset-0">
                    <ILoading />
                </div>
            )}
        </div>
    )
}