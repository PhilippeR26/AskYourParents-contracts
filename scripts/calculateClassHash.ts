// Calculate the class hash of a compiled contract.
// Launch with : npx hardhat run scripts/calculateClassHash.ts

import hardhat, { starknet } from "hardhat";
import type { Account } from "hardhat/types/runtime";
import hre from "hardhat";
import LogC from "../src/logColors";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

// You must have a Starknet python environment activated (see https://starknet.io/docs/quickstart.html )
// 🚨🚨🚨🚨 Operate only in devnet 🚨🚨🚨🚨
// 
//        👇👇👇
// 🚨🚨🚨 launch 'starknet-devnet --seed 0' before using this script.
//        👆👆👆
// In hardhat.config.ts file, configure starknet.network to 'devnet'.

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, '\nClass hash calculation in progress...');
    let accountParent: Account;
    switch (whichNetwork) {
        case "devnet":
            // Recovery of data of predeployed wallets in devnet
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            // Define Parent Wallet.
            accountParent = await starknet.getAccountFromAddress(
                ListOfWallet[0].address,
                ListOfWallet[0].private_key,
                "OpenZeppelin"
            );
            break;

        default:
            throw new Error("Only Devnet authorized for this script!")
    }

    // 🚨🚨🚨 Put here the name of the contract code source : 👇👇👇
    const sourceContract = "contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo";

    await hardhat.run("starknet-compile", { paths: [sourceContract], disableHintValidation: true, accountContract: true });
    //await hardhat.run("starknet-compile", { paths: [sourceContract], disableHintValidation: true });

    const contractFactory = await starknet.getContractFactory(sourceContract);

    const classHash = await accountParent.declare(contractFactory, { maxFee: 5_000_000_000_000_000 });// as Fee of Declare function can't be estimated in Hardhat, let's jump in with a rough and over-evaluated value....

    console.log("Contract declared on Devnet.");
    console.log("✅ Contract class hash :", LogC.fg.green + classHash, LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });
