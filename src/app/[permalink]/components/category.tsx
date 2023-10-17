"use client"

import "swiper/css"
import "swiper/css/scrollbar"
import { Swiper, SwiperSlide } from "swiper/react"
import { Scrollbar } from "swiper/modules"
import Link from "next/link"

interface CategoryProps {
    permalink: string
    categories: {
        id_kategori_produk: string
        kategori: string
        count: string
    }[]
    onSelected?: (value: string) => void
    swipe?: boolean
}

export default function Category({
    categories,
    swipe,
    permalink,
}: CategoryProps) {
    if (swipe) {
        return (
            <>
                <div className="px-6 pt-6">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-700">Kategori</h3>
                </div>

                <div className="relative w-full max-w-full">
                    <Swiper
                        scrollbar={{
                            hide: true,
                        }}
                        modules={[Scrollbar]}
                        className="mySwiper"
                        spaceBetween={15}
                        slidesPerView={3}
                        slidesOffsetAfter={25}
                        slidesOffsetBefore={25}
                        style={{ paddingBottom: "15px", paddingTop: "15px" }}
                    >
                        <SwiperSlide>
                            <div className="relative shadow rounded-xl hover:bg-stora-500/25 h-12 px-4 py-3">
                                <h3 className="text-xs truncate text-gray-800">Semua kategori</h3>
                                <Link
                                    href={`/${permalink}?categories=all`}
                                    className="absolute inset-0"
                                >&nbsp;</Link>
                            </div>
                        </SwiperSlide>

                        {categories.map((item) => (
                            <SwiperSlide key={item.id_kategori_produk}>
                                <div className="relative shadow rounded-xl hover:bg-stora-500/25 h-12 px-4 py-3">
                                    <h3 className="text-xs truncate text-gray-800">{item.kategori}</h3>
                                    <Link
                                        href={`/${permalink}?category=${item.id_kategori_produk}`}
                                        className="absolute inset-0"
                                    >&nbsp;</Link>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </>
        )
    }

    return (
        <div className="overflow-x-scroll">
            <ul className="flex gap-4">
                {categories.map((item) => (
                    <li key={item.id_kategori_produk} className="p-4 shadow bg-stora-500 w-full max-w-[200px] rounded-lg text-white">
                        <div className="flex items-center space-between">
                            <h3 className="text-xs font-medium whitespace-nowrap">
                                {item.kategori}{' '}
                                {item.count}
                            </h3>
                            <div className="text-left">
                                <span className="text-xs text-gray-600 font-normal"></span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
