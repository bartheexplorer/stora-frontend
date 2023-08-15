import Image from "next/image"
import stora from "@/app/assets/stora.png"

export default function Gogo() {
    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-6 sm:py-12">
            <div className="relative bg-white px-6 pt-10 pb-8 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
                <div className="mx-auto max-w-md">
                    <Image
                        src={stora}
                        alt="Stora"
                        width={75}
                        height={75}
                    />
                </div>
            </div>
        </div>
    )
}