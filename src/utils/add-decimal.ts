import Big from "big.js"

export function sumTotal(num1: string, num2: string) {
    try {
        const bigNum1 = new Big(num1)
        const bigNum2 = new Big(num2)
        return bigNum1.plus(bigNum2)
            .toNumber()
    } catch (error) {
        return 0
    }
}

export function multiplySubTotal(num1: string, num2: string) {
    try {
        const bigNum1 = new Big(num1)
        const bigNum2 = new Big(num2)
        return bigNum1.times(bigNum2).toNumber()
    } catch (error) {
        return 0
    }
}

export const addDecimals = (num: number) => {
    return (Math.round(num * 100) / 100) // 12.3456 to 12.35
}

export const addDecimalsToFix = (num: number) => {
    return (Math.round(num * 100) / 100).toFixed(2) // 12.3456 to 12.35
}