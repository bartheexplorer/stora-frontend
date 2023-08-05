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
        <>
            <Swiper
                navigation={true}
                modules={[Navigation]}
                className="mySwiper"
                style={{
                    paddingTop: '10px',
                    paddingBottom: '20px',
                }}
            >
                {video && (
                    <SwiperSlide>
                        <iframe
                            width="560"
                            height="315"
                            src={video}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
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
