import { usePhotoProduct } from "@/hooks/product"
import Image from "next/image"

interface PhotoProductProps {
    fileName: string
    userId: string
}

export default function PhotoProduct({
    fileName,
    userId,
}: PhotoProductProps) {
    const {
        data: dataPhotoProduct,
    } = usePhotoProduct(fileName, userId)

    if (!dataPhotoProduct?.data) return null

    return (
        <Image
            src={dataPhotoProduct.data.data1}
            alt={dataPhotoProduct.data.data1}
            loader={({ src, width }) => `${src}?width=${width}`}
            width={300}
            height={300}
            className="h-full w-full border-0 object-center lg:h-full lg:w-full"
        />
    )
}