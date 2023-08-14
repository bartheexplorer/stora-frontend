// Bang bang
import bca from "@/app/assets/logo-bang-bang/bca.png"
import bri from "@/app/assets/logo-bang-bang/bri.png"
import bsi from "@/app/assets/logo-bang-bang/bsi.png"
import mandiri from "@/app/assets/logo-bang-bang/mandiri.png"
import bni from "@/app/assets/logo-bang-bang/bni.png"
import permata from "@/app/assets/logo-bang-bang/permata.png"
import bjb from "@/app/assets/logo-bang-bang/bjb.png"
import qris from "@/app/assets/logo-bang-bang/qris.png"
import sampoerna from "@/app/assets/logo-bang-bang/sahabat-sampoerna.png"
import cod from "@/app/assets/logo-bang-bang/cod.png"
import Image from "next/image"

export default function BankLogo({ id }: { id: string }) {
    if (id === "21" || id === "35") {
        return <Image
            src={bca}
            alt="BCA"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "171" || id === "40") {
        return <Image
            src={mandiri}
            alt="Mandiri"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "172" || id === "39") {
        return <Image
            src={bsi}
            alt="BSI"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "174" || id === "36") {
        return <Image
            src={bni}
            alt="BNI"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "738" || id === "37") {
        return <Image
            src={bri}
            alt="BRI"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "41") {
        return <Image
            src={permata}
            alt="Permata"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "38") {
        return <Image
            src={bjb}
            alt="Bjb"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "qris") {
        return <Image
            src={qris}
            alt="Qris"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "42") {
        return <Image
            src={sampoerna}
            alt="Sampoerna"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "19") {
        return <Image
            src={qris}
            alt="Qris"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "cod") {
        return <Image
            src={cod}
            alt="COD"
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
        />
    }

    return null
}