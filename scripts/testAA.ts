// deployOZwallet.ts
// deploy Parent and game wallets in Alpha testnet.
// Automatically deployed in devnet.
import { AAccount } from "hardhat";
import hre from "hardhat";
//import { adaptAddress } from "../src/util";
import LogC from "../src/logColors";
import { adaptAddress } from "../src/util";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network : " + LogC.fg.yellow + whichNetwork, LogC.reset);
    console.log("example.sayHello =", hre.AAccount.sayHello(), "\nAAccount compilation and deployment in progress...");
    const Test1Account = await AAccount.deployAccountAA("ChildrenAA");
    const Test1address = adaptAddress(Test1Account.address);
    console.log("✅ AAccount1 deployed at = " + LogC.fg.green + Test1address + LogC.reset);
    console.log("   wallet private key = " + LogC.fg.green + Test1Account.privateKey + LogC.reset)
    const Test2Account = await AAccount.getAccountAAfromAddress(Test1address, Test1Account.privateKey, "ChildrenAA");
    const Test2address = adaptAddress(Test2Account.address);
    console.log("\n✅ AAccount2 deployed at = " + LogC.fg.green + Test2address + LogC.reset);
    console.log("   wallet private key = " + LogC.fg.green + Test2Account.privateKey + LogC.reset + '\n wallets should be the same.\n');
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

