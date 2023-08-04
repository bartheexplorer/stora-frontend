"use client"

import "swiper/css"
import "swiper/css/scrollbar"
import { Swiper, SwiperSlide } from "swiper/react"
import { Scrollbar } from "swiper/modules"

interface CategoryProps {
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
}: CategoryProps) {
    if (swipe) {
        return (
            <Swiper
                scrollbar={{
                    hide: true,
                }}
                modules={[Scrollbar]}
                className="mySwiper"
                spaceBetween={20}
                slidesPerView={3}
                slidesOffsetAfter={20}
                slidesOffsetBefore={20}
                style={{ paddingBottom: "20px", paddingTop: "15px" }}
            >
                {categories.map((item) => (
                    <SwiperSlide key={item.id_kategori_produk} className="relative h-28">
                        <div className="shadow p-6 rounded-lg bg-stora-500">
                            <h3 className="text-xs truncate text-white">{item.kategori}</h3>
                        </div>
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 text-center bg-gray-300 rounded-full text-[10px] flex items-center justify-center tracking-wide">{item.count}</div>
                    </SwiperSlide>
                ))}
            </Swiper>
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
