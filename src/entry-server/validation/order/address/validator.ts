import {
    AddressTypeRequestSchema,
    OngkirArveoliRequestSchema,
    OngkirRajaongkirRequestSchema,
    RegecyArveoliRequestSchema,
    SubDistrictArveoliRequestSchema,
    UrbanVillageArveoliRequestSchema,
} from "./schema"

export function validateAddressTypeRequest(input: unknown) {
    return AddressTypeRequestSchema.parse(input)
}

export function validateRegecyArveoliRequest(input: unknown) {
    return RegecyArveoliRequestSchema.parse(input)
}

export function validateSubDistrictArveoliRequest(input: unknown) {
    return SubDistrictArveoliRequestSchema.parse(input)
}

export function validateUrbanVillageArveoliRequest(input: unknown) {
    return UrbanVillageArveoliRequestSchema.parse(input)
}

export function validateOngkirArveoliRequest(input: unknown) {
    return OngkirArveoliRequestSchema.parse(input)
}

export function validateOngkirRajaongkirRequest(input: unknown) {
    return OngkirRajaongkirRequestSchema.parse(input)
}
