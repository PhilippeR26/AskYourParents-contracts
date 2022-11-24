// Read the ETH balance of the parent account.
// 
import { uint256ToBN } from "starknet/dist/utils/uint256";
import { toHex, hexToDecimalString } from "starknet/dist/utils/number";
import { starknet } from "hardhat";
import type { StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import LogC from "../src/logColors";
import { addrECUdevnet, addrETHalpha, addrETHalpha2, addrETHdevnet, addrGameAlpha2, addrParentAlpha, addrParentAlpha2 } from "../src/const";
import { getETHinWallet } from "./getBalance";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });



async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);

    let addrETH: string;
    switch (whichNetwork) {
        case "devnet":
            //addrETH = addrETHdevnet; // with normal devnet (not forked)
            addrETH = addrETHalpha2; // with Alpha (or alpha2) forked into devnet
            break;
        case "alpha":
            addrETH = addrETHalpha;
            break;
        case "alpha-goerli-2":
            addrETH = addrETHalpha2;
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }

    // *********************************************************************************
    // Define 👇 the adress of the wallet to analyse
    //const addrWallet = ListOfWalletDevnet[0].address; // for predeployed wallets in devnet
    const addrWallet = "0x6de80124118de86b8315a1d331c6c2b82586c3ee1044263cdefd3adec3a41b1";
    // *********************************************************************************

    const result2 = await getETHinWallet(addrWallet, addrETH);
    console.log("Amount of ETH in wallet address ", addrWallet, " =", LogC.fg.green, Number(result2) / 1E18, "ETH", LogC.reset, "\n dec =", result2);


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

