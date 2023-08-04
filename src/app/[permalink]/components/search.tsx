"use client"

import { useCallback } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { type IFormSearch, SearchSchema } from "./form-search-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function Search() {
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

    const { register, handleSubmit } = useForm<IFormSearch>({
        resolver: zodResolver(SearchSchema),
        defaultValues: {
            q: searchParams.get('q')?.toString(),
        },
    })

    const submitAction: SubmitHandler<IFormSearch> = (data) => {
        router.push(pathname + '?' + createQueryString('q', data.q))
    }

    return (
        <div className="mt-4 mx-auto max-w-xs sm:max-w-sm">
            <form onSubmit={handleSubmit(submitAction)}>
                <label htmlFor="search" className="sr-only block text-xs sm:text-sm font-medium text-gray-800">
                    Search
                </label>
                <div className="flex items-center rounded-3xl shadow border border-gray-100 bg-gray-50">
                    <div className="flex items-center pl-3">
                        <button type="submit">
                            <span className="text-gray-500 sm:text-sm">
                                <svg width="24" height="24" fill="none" aria-hidden="true" className="mr-3 flex-none"><path d="m19 19-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle></svg>
                            </span>
                        </button>
                    </div>
                    <input
                        {...register('q')}
                        className="block w-full rounded-3xl pl-3 pr-10 sm:pr-12 focus:outline-none text-xs text-gray-800 font-normal py-3.5"
                        placeholder="Search"
                    />
                </div>
            </form>
        </div>
    )
}