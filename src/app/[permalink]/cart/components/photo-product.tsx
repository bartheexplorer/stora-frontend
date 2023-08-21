"use client"

import { usePhotoProduct } from "@/hooks/product"
import Image from "next/image"
import ILoading from "./loading"

export default function PhotoProduct(props: {
    images: string
    user_id: string
}) {
    const {
        data: photoProductData,
        error,
    } = usePhotoProduct(props.images, props.user_id)
    if (!photoProductData) return <ILoading />

    return (
        <Image
            loader={({ src, width }) => {
                return `${src}?width=${width}`
            }}
            src={photoProductData.data.data1}
            width={350}
            height={350}
            alt={props.images}
            className="h-full w-full object-cover object-center"
        />
    )
}