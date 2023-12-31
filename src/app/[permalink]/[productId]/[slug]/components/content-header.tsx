"use client"

import "swiper/css"
import "swiper/css/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import PhotoProduct from "./photo-product"

interface ContentHeaderProps {
    images: string[]
    video: string | null
    userId: string
}

export default function ContentHeader({
    images,
    video,
    userId,
}: ContentHeaderProps) {
    return (
        <div className="px-12">
            <Swiper
                autoHeight={true}
                navigation={true}
                modules={[Navigation]}
                className="mySwiper"
            >
                {video && (
                    <SwiperSlide>
                        <div className="flex items-center h-full">
                            <div className="aspect-h-1 aspect-w-2 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                                <iframe
                                    src={video}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                ></iframe>
                            </div>
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
        </div>
    );
}
