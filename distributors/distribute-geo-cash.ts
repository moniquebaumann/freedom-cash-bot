import { Distributor } from "./geo-cash-distributor.ts"

const distributor = await Distributor.getInstance()
await distributor.distributeGeoCash()