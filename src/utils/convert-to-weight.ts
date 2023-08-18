export function gramsToKilogramsAndCeil(grams: number): number {
    if (typeof grams !== "number" || grams < 0) {
        return 1
    }

    const kilograms: number = grams / 1000;
    const roundedKilograms: number = Math.ceil(kilograms);
    if (roundedKilograms <= 0) return 1 
    return roundedKilograms;
}