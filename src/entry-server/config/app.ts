import invariant from "tiny-invariant"

invariant(typeof process.env.DOMAIN_API_STORA === "string", "DOMAIN_API_STORA not found")
invariant(typeof process.env.DOMAIN_ASSETS_STORA === "string", "DOMAIN_ASSETS_STORA not found")
invariant(typeof process.env.DOMAIN_API_ARVEOLI === "string", "DOMAIN_API_ARVEOLI not found")
invariant(typeof process.env.APPKEY_ARVEOLI === "string", "APPKEY_ARVEOLI not found")
invariant(typeof process.env.ACCESSKEY_ARVEOLI === "string", "ACCESSKEY_ARVEOLI not found")
invariant(typeof process.env.DOMAIN_API_RAJAONGKIR === "string", "DOMAIN_API_RAJAONGKIR not found")
invariant(typeof process.env.APPKEY_RAJAONGKIR === "string", "APPKEY_RAJAONGKIR not found")
invariant(typeof process.env.DOMAIN_EP === "string", "DOMAIN_EP not found")

export const appConfig = {
    domain: {
        storaApi: process.env.DOMAIN_API_STORA,
        storaAssets: process.env.DOMAIN_ASSETS_STORA,
        ep: process.env.DOMAIN_EP,
    },
    arveoli: {
        apiUrl: process.env.DOMAIN_API_ARVEOLI,
        appKey: process.env.APPKEY_ARVEOLI,
        accessKey: process.env.ACCESSKEY_ARVEOLI,
    },
    rajaOngkir: {
        apiUrl: process.env.DOMAIN_API_RAJAONGKIR,
        appKey: process.env.APPKEY_RAJAONGKIR,
    }
}
