import Image from "next/image"

export default function LoaderUi() {
    return (
        <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden py-6 sm:py-12">
            <div className="flex items-center justify-center w-full">
                <div className="w-20 h-16">
                    <Image
                        src="/images/stora.png"
                        alt="Stora"
                        width={500}
                        height={500}
                        className="w-full h-full bg-center"
                        priority
                    />
                </div>
            </div>
        </div>
    )
}