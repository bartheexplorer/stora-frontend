"use client"

import { useDestroyCartById } from "@/hooks/cart"
import { TrashIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useState } from "react"
import ILoading from "./loading"

interface BtnRemoveProduct {
    cartId: string
}

export default function BtnRemoveProduct(props: BtnRemoveProduct) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const {
        sendRequest: removeProduct,
        isLoading: loadingRemoveCart
    } = useDestroyCartById()

    return (
        <AlertDialog.Root
            open={open}
            onOpenChange={setOpen}
        >
            <AlertDialog.Trigger asChild>
                <button
                    type="button"
                    className="font-medium text-xs text-indigo-600 hover:text-indigo-500"

                >
                    <TrashIcon className="text-red-500 w-4 h-4" />
                </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
                <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-8 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                    <AlertDialog.Title className="text-gray-600 m-0 text-sm font-medium">
                        Hapus
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-gray-500 mt-1 mb-5 text-xs leading-normal">
                        Anda akan menghapus produk ini?
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-[25px]">
                        <AlertDialog.Cancel asChild>
                            <button className="text-white bg-stora-500 hover:bg-stora-500/25 focus:shadow inline-flex h-[35px] items-center justify-center rounded-lg px-[15px] text-xs font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                                Batal
                            </button>
                        </AlertDialog.Cancel>
                        <button
                            type="button"
                            className="relative text-red-500 focus:shadow inline-flex h-[35px] items-center text-xs justify-center rounded-lg px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
                            onClick={async () => {
                                await removeProduct(props.cartId)
                                setOpen(false)
                                router.refresh()
                            }}
                            disabled={loadingRemoveCart}
                        >
                            {loadingRemoveCart && (
                                <div className="absolute inset-0">
                                    <ILoading />
                                </div>
                            )}
                            <span>Ya, hapus produk</span>
                        </button>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>

    )
}