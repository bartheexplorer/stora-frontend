import icon from "@/app/assets/bag.svg"
import Image from "next/image"

export default function ShoppingCartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <Image
      className={className}
      src={icon}
      alt="Shopping Cart"
      width={300}
      height={300}
    />
  )
}