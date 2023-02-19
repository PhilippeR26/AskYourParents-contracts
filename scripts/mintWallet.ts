// send 50 ETH to the Children wallet (on devnet only)
// 
import hre from "hardhat";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import { adaptAddress } from "../src/util";
import { Account } from "../src/HHstarknetAbstractAccount/accountAA";
import { getETHinWallet } from "./getBalance";
import * as dotenv from 'dotenv';
import { addrChildrenDevnet, addrETHdevnet } from "../src/const";
import axios from "axios";
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    switch (whichNetwork) {
        case "devnet":
            // address to feed 👇 👇
            const caAddress = "0x0592d37DF7702c411BD72b577687A7F7c9759362cDDe76299e7c0865f47a883C";
            //
            const ETHaddress = addrETHdevnet;
            const initialBalance = await getETHinWallet(caAddress, ETHaddress);
            console.log("initialBalance =", Number(initialBalance) / 1E18, "ETH")
            const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": caAddress, "amount": 50000000000000000000, "lite": true }, { headers: { "Content-Type": "application/json" } });
            console.log('Answer =', answer);
            const finalBalance = await getETHinWallet(caAddress, ETHaddress);
            console.log("finalBalance =", Number(finalBalance) / 1E18, "ETH")

            break;
        default:
            throw new Error("Only devnet authorized for this script!");
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

