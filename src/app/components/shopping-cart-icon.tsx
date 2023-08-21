import Image from "next/image"

export default function ShoppingCartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Image
      className={className}
      src="/images/bag.svg"
      alt="Shopping Cart"
      width={300}
      height={300}
      priority
    />
  )
}