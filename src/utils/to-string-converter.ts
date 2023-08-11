export function validateAndConvertToString(input: string[] | undefined): string {
    if (typeof input === 'undefined') {
        return '' // Return an empty string for undefined input
    } else {
        // Filter out any non-string elements and trim the strings
        const validStrings = input.filter(item => typeof item === 'string').map(item => item.trim())

        // Join the valid strings with commas to create a single string
        return validStrings.join(', ')
    }
}