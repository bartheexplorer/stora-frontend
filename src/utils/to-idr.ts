const numberFormatter = new Intl.NumberFormat("id-ID")

const formatNum = (amount: number): string => {
    return numberFormatter.format(amount)
}

export function toIDR(value: string) {
    try {
        return `Rp${formatNum(Number(value))}`
    } catch (error) {
        return 'Err'
    }
}
