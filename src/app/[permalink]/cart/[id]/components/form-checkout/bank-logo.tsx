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

export default function BankLogo(props: { id: string }) {
    const id = props.id.toUpperCase()
    if (id === "BANK CENTRAL ASIA" || id === "BCA") {
        return <Image
            src={bca}
            alt="BCA"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "BANK MANDIRI" || id === "MANDIRI") {
        return <Image
            src={mandiri}
            alt="Mandiri"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "BANK SYARIAH INDONESIA" || id === "BSI") {
        return <Image
            src={bsi}
            alt="BSI"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "BANK NEGARA INDONESIA" || id === "BNI") {
        return <Image
            src={bni}
            alt="BNI"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "BANK RAKYAT INDONESIA" || id === "BRI") {
        return <Image
            src={bri}
            alt="BRI"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "PERMATA") {
        return <Image
            src={permata}
            alt="Permata"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "BJB") {
        return <Image
            src={bjb}
            alt="Bjb"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "QRIS") {
        return <Image
            src={qris}
            alt="Qris"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "SAHABAT_SAMPOERNA") {
        return <Image
            src={sampoerna}
            alt="Sampoerna"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "19") {
        return <Image
            src={qris}
            alt="Qris"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    if (id === "COD") {
        return <Image
            src={cod}
            alt="COD"
            width={500}
            height={300}
            className="h-full w-full object-cover object-center"
        />
    }

    return null
}