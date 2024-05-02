import { ethers, Logger } from "./deps.ts"
import "https://deno.land/x/dot_env@0.2.0/load.ts"

export const Geld = "0xb841A4f979F9510760ecf60512e038656E68f459"

let loggerInstance: Logger
export async function getLogger() {
    if (loggerInstance === undefined) {
        const minLevelForConsole = 'INFO'
        const minLevelForFile = 'WARNING'
        const fileName = "./warnings-errors.txt"
        const pureInfo = true // leaving out e.g. the time info
        loggerInstance = await Logger.getInstance(minLevelForConsole, minLevelForFile, fileName, pureInfo)
    }
    return loggerInstance
}
export function getProvider(logger: Logger) {
    return new ethers.JsonRpcProvider(getProviderURL(logger))
}
export function getABI(url: string) {
    return JSON.parse(Deno.readTextFileSync(url))
}
export async function getContract(contractAddress: string, provider: any, url: string): Promise<any> {
    console.log(`getting contract ${contractAddress}`)
    // const signer = await provider.getSigner()
    const pkTestWallet = Deno.env.get("pkTestWallet");
    const wallet = new ethers.Wallet(pkTestWallet, provider)
    const signer = await wallet.connect(provider)
    console.log(`signer address: ${await signer.getAddress()}`)
    return new ethers.Contract(contractAddress, getABI(url), signer)
}
export function getProviderURL(logger: Logger): string {
    let configuration: any = {}
    if (Deno.args[0] !== undefined) { // supplying your provider URL via parameter
        return Deno.args[0]
    } else { // ... or via .env
        try {
            const providerURL = Deno.env.get("providerURL");
            console.log(providerURL)
            return providerURL
        } catch (error) {
            logger.error(error.message)
            logger.error("without a providerURL I cannot connect to the blockchain")
        }
    }
    throw new Error("could not get a providerURL")
}