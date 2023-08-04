"use client"

import { shimmer, toBase64 } from "@/utils/shimmer";
import Image from "next/image"

export default function ImageProfile({ logo, nama_toko }: { logo: string; nama_toko: string }) {
    return <Image
        src={`/assets/image/toko/${logo}`}
        alt={`${nama_toko}`}
        width={384}
        height={512}
        placeholder="blur"
        loader={({ src, width }) => {
            return `${src}?width=${width}`
        }}
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(384, 512))}`}
        className="inline-block h-[120px] w-[120px] rounded-full shadow-lg"
    />
}