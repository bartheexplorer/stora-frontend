export function getLastThreeWords(inputString: string): string {
    if (inputString.length <= 3) {
        return inputString;
    }

    return inputString.slice(-3);
}
