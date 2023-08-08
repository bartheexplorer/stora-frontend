"use client"

import "swiper/css"
import "swiper/css/scrollbar"
import "swiper/css/pagination"
import "./content-scroll-header.module.css"
import { Swiper, SwiperSlide } from "swiper/react"
import { Scrollbar, Pagination } from "swiper/modules"
import PhotoProduct from "./photo-product"
import Link from "next/link"

interface ContentHeaderProps {
    images: string[]
    video: string | null
    userId: string
}

export default function ContentScrollHeader({
    images,
    video,
    userId,
}: ContentHeaderProps) {
    return (
        <>
            <Swiper
                autoHeight={true}
                scrollbar={{
                    hide: true,
                }}
                pagination={{
                    type: "fraction",
                    formatFractionTotal: (vl) => {
                        return vl - 1
                    },
                    renderFraction: (currentClass, totalClass) => {
                        console.log(currentClass)
                        console.log(totalClass)
                        return `<div style="color: #94a3b8; padding: 5px; font-size: 0.75rem; line-height: 1rem; display: flex;">
                            <div style="background-color: rgb(241 245 249); width: 1.75rem; text-align: center; border-radius: 0.25rem;"><span class="${currentClass}"></span>/<span class="${totalClass}"></span></div>
                        </div>`
                    },
                }}
                spaceBetween={20}
                slidesPerView={1}
                slidesOffsetAfter={8}
                slidesOffsetBefore={8}
                modules={[Scrollbar, Pagination]}
                className="mySwiper"
                style={{
                    paddingLeft: "18px",
                    paddingRight: "18px",
                }}
            >
                {!!video && (
                    <SwiperSlide>
                        <div className="relative flex items-center h-full">
                            <div className="aspect-h-1 aspect-w-2 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-75 h-96 rounded-lg">
                                <iframe
                                    src={video}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                ></iframe>
                            </div>
                            <Link href={video} target="_blank" className="absolute inset-0 z-40">&nbsp;</Link>
                        </div>
                    </SwiperSlide>
                )}

                {images.map((item) => {
                    return (
                        <SwiperSlide key={item}>
                            <PhotoProduct
                                fileName={item}
                                userId={userId}
                            />
                        </SwiperSlide>
                    )
                })}
            </Swiper>
        </>
    );
}
