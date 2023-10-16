"use client"

import React, { useCallback } from "react"
import * as Select from "@radix-ui/react-select"
import clsx from "clsx"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface SelectItemProps {
    children: React.ReactNode;
    className?: string;
    value: string
    disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ children, className, ...props }, forwardedRef) => {
    return (
        <Select.Item
            className={clsx(
                'text-[13px] leading-none text-stora-800 rounded flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-stora-600 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-stora-100 data-[highlighted]:text-stora-800',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                <CheckIcon />
            </Select.ItemIndicator>
        </Select.Item>
    );
});

SelectItem.displayName = 'SelectItem'

export default function SortingProduct() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()!

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

    return (
        <Select.Root
            onValueChange={(value) => {
                router.push(pathname + '?' + createQueryString('sort', value.toString()))
            }}
            defaultValue="terbaru"
        >
            <Select.Trigger
                className="inline-flex items-center justify-center rounded-lg px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-gray-800 shadow-[0_2px_10px] shadow-black/10 hover:bg-gray-50 focus-none data-[placeholder]:text-gray-900 outline-none"
                aria-label="Food"
            >
                <Select.Value placeholder="Urutkan" />
                <Select.Icon className="text-stora-800">
                    <ChevronDownIcon />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content position="popper" className="overflow-hidden bg-white rounded-lg shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-stora-700 cursor-default">
                        <ChevronUpIcon />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        <Select.Group>
                            <SelectItem value="terbaru">Terbaru</SelectItem>
                            <SelectItem value="terlaris">Terlaris</SelectItem>
                        </Select.Group>
                    </Select.Viewport>
                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-stora-700 cursor-default">
                        <ChevronDownIcon />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}
