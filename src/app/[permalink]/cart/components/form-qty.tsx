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

    const num = (length: number = 50) => {
        const array: number[] = []
        for (let index = 1; index <= length; index++) {
            array.push(index);

        }

        return array.map((item) => (<option key={item} value={item}>{item}</option>))
    }

    return (
        <div className="relative">
            <form onSubmit={onHandleSubmit}>
                <select
                    {...register("qty")}
                    className="focus:outline-none py-2 shadow px-1 rounded-lg"
                    onChange={async (event) => {
                        await updateCart({
                            qty: event.target.value,
                            cartId: props.cartId,
                        })
                        router.refresh()
                    }}
                >
                    {num()}
                </select>
            </form>
            {loadingUpdate && (
                <div className="absolute inset-0">
                    <ILoading />
                </div>
            )}
        </div>
    )
}