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
    const _linkVideo = () => {
        const _video = video

        if (!_video) {
            return null
        }
        // console.log("_video", _video)

        // const youtubeCopyLink: string = "https://www.youtube.com/watch?v=Phj2LnkmXbg"
        // const ytCopyMobile: string = `https://m.youtube.com/watch?v=1mDkixgzxhw`
        // const youtubeOriginEmbeded: string = "https://youtu.be/Phj2LnkmXbg?si=XbJj-UtuGqbwg5Qc"
        // const youtubeOriginEmbeded1: string = "https://youtu.be/Phj2LnkmXbg/asdasdasd?si=XbJj-UtuGqbwg5Qc"

        // const youtubeCopyFrame: string = `<iframe width="560" height="315" src="https://www.youtube.com/embed/Phj2LnkmXbg?si=ZABVUCaLMU4dTbaW" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

        try {
            const _link = new URL(_video)
            const _host = _link.host

            if (_host === "www.youtube.com") {
                const ss = _link.searchParams.get("v")
                if (ss) {
                    return "https://www.youtube.com/embed/" + _link.searchParams.get("v")
                }
                return _video
            }

            if (_host === "m.youtube.com") {
                return "https://www.youtube.com/embed/" + _link.searchParams.get("v")
            }

            if (_host === "youtu.be") {
                const searchPath = _link.pathname.trimStart()
                const pathSplit = searchPath.split("/")
                const _se = pathSplit.at(1)
                if (_se) {
                    return "https://www.youtube.com/embed/" + pathSplit.at(1)
                }
                return null
            }

            return null
        } catch (error) {
            return null
        }
    }

    const createMarkup = () => {
        const _video = video

        if (!_video) {
            return null
        }

        try {
            new URL(_video)
            return null
        } catch (error) {
            const _r = _video.includes("src")
            if (_r) {
                return { __html: _video }
            }
            return null
        }
    }

    const _link = _linkVideo()
    const _linkS = createMarkup()

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
                        return vl
                    },
                    renderFraction: (currentClass, totalClass) => {
                        return `<div style="color: #94a3b8; padding: 5px; font-size: 0.75rem; line-height: 1rem; display: flex;">
                            <div style="background-color: rgb(241 245 249); width: 1.75rem; text-align: center; border-radius: 0.25rem;"><span class="${currentClass}"></span>/<span class="${totalClass}"></span></div>
                        </div>`
                    },
                }}
                spaceBetween={16}
                slidesPerView={1}
                // slidesOffsetAfter={8}
                // slidesOffsetBefore={8}
                modules={[Scrollbar, Pagination]}
                className="mySwiper"
            // style={{
            //     paddingLeft: "18px",
            //     paddingRight: "18px",
            // }}
            >
                {!!_link && (
                    <SwiperSlide>
                        <div className="relative flex items-center h-full">
                            <div className="aspect-h-1 aspect-w-2 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-75 h-96">
                                <iframe
                                    src={_link}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                ></iframe>
                            </div>
                            <Link href={_link} target="_blank" className="absolute inset-0 z-40">&nbsp;</Link>
                        </div>
                    </SwiperSlide>
                )}

                {_linkS && (
                    <SwiperSlide>
                        <div dangerouslySetInnerHTML={_linkS} />
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
