export function getRandomThreeDigitNumber(): number {
    return Number((Math.floor(Math.random() * 100)).toString().padStart(2, '0'))
}

export function getRandomThreeDigitNumber2(): number {
    return Math.floor(Math.random() * 900) + 100;
}