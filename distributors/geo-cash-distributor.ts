import { Logger, sleep, ethers } from "./deps.ts"
import { getLogger, getProvider, getContract, Geld } from "./helper.ts"
import { rewardRequestsFromFriendsOfSatoshi } from "./some-of-the-first-requests-from-friends-of-satoshi.ts"
import "https://deno.land/x/dot_env@0.2.0/load.ts"

export class Distributor {

    public static instance

    public static async getInstance(): Promise<Distributor> {
        if (Distributor.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contract = await getContract(Geld,
                provider,
                "./geo-cash-abi.json")
            Distributor.instance = new Distributor(logger, provider, contract)
        }
        return Distributor.instance
    }

    private logger: Logger
    private provider: any
    private contract: any
    private rewardRequestsFromFriendsOfSatoshi: any[] = []

    protected constructor(logger: Logger, provider: any, contract: any) {
        this.logger = logger
        this.provider = provider
        this.contract = contract
        this.rewardRequestsFromFriendsOfSatoshi = this.shuffle(this.deleteDuplicates(rewardRequestsFromFriendsOfSatoshi))
    }

    public async distributeGeoCash() {
        const sleepTime = 9
        const pkTestWallet = Deno.env.get("pkTestWallet");
        const wallet = new ethers.Wallet(pkTestWallet, this.provider)
        const signer = await wallet.connect(this.provider)
        let start = 0
        let minDelta = 36

        const sender = await signer.getAddress()
        console.log(sender)

        let counter = 0
        let receivers = []
        while (counter < this.rewardRequestsFromFriendsOfSatoshi.length) {
            try {
                const balance = await this.contract.balanceOf(this.rewardRequestsFromFriendsOfSatoshi[counter])
                if (balance == 0) {
                    receivers.push(this.rewardRequestsFromFriendsOfSatoshi[counter])
                } else {
                    this.logger.info(`${this.rewardRequestsFromFriendsOfSatoshi[counter]} already has ${balance} Geo Cash`)
                }
                counter++
                this.logger.info(`${receivers.length} candidates with counter ${counter}`)

                if (receivers.length > minDelta) {
                    const currentGasPrice = (await this.provider.getFeeData()).gasPrice
                    this.logger.info(`currentGasPrice: ${currentGasPrice}`)
                    if (currentGasPrice < 45000000000) {
                        
                        this.logger.warning(`amount of receivers: ${receivers.length}`)
                        
                        const amountPerReceiver = BigInt(360 * 10 ** 18)
                        const total = amountPerReceiver * BigInt(receivers.length)
                        const balance = await this.contract.balanceOf(sender)
                        this.logger.warning(ethers.formatEther(balance))
                        const allowance = await this.contract.allowance(sender, Geld)
                        this.logger.warning(ethers.formatEther(allowance))
                        let tx
                        if (allowance < balance) {
                            tx = await this.contract.approve(Geld, balance)
                            this.logger.info(`approve tx: ${tx.hash}`)
                            await tx.wait()
                        }
                        tx = await this.contract.distributeGeoCash(amountPerReceiver, receivers)
                        this.logger.info(`https://polygonscan.com/tx/${tx.hash}`)
                        receivers = []
                    }

                }
            } catch (error) {
                this.logger.error(error.message)
            }

            await sleep(0.09)
        }

    }

    public deleteDuplicates(input: any[]) {
        this.logger.warning(`array length before: ${input.length}`)
        const clean = []
        for (const entry of input) {
            if (clean.indexOf(entry) === -1) {
                clean.push(entry)
            }
        }
        this.logger.warning(`array length after: ${clean.length}`)
        return clean
    }

    public shuffle(array: any[]) { // first come first serve might be problematic because of different input channels --> shuffle --> Heisenberg
        let currentIndex = array.length,
            randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    
        return array;
    }    
}
