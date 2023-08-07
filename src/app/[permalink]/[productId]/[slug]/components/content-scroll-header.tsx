"use client"

import "swiper/css"
import "swiper/css/scrollbar"
import { Swiper, SwiperSlide } from "swiper/react"
import { Scrollbar } from "swiper/modules"
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
                spaceBetween={20}
                slidesPerView={1}
                slidesOffsetAfter={20}
                slidesOffsetBefore={20}
                modules={[Scrollbar]}
                className="mySwiper"
                style={{ paddingLeft: "25px", paddingRight: "25px" }}
            >
                {video && (
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
