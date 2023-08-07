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
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden lg:aspect-none group-hover:opacity-75 lg:h-96 rounded-lg">
            <Image
                src={dataPhotoProduct.data.data1}
                alt={dataPhotoProduct.data.data1}
                loader={({ src, width }) => `${src}?width=${width}`}
                width={300}
                height={300}
                className="h-full w-full object-cover object-center lg:h-full lg:w-full"
            />
        </div>
    )
}