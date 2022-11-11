// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { toBN, toHex } from "starknet/dist/utils/number";
import { starknet } from "hardhat";
import type { StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import { addrChildrenAlpha2 } from "../src/const";
import { adaptAddress } from "../src/util";


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);

    const childrenAccount = await AAccount.deployAccountAA("ChildrenAA");
    const childrenAccountAddress = adaptAddress(childrenAccount.address);
    const childrenAccountPrivateKey = childrenAccount.privateKey;

    console.log("✅ Children wallet address=", childrenAccountAddress, "\n  Copy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrChildrenAlpha2" : whichNetwork === "alpha" ? "addrChildrenAlpha" : "addrChildrenDevnet");
    console.log("\n  wallet private key=", childrenAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY" : whichNetwork === "alpha" ? "OZ_CHILDREN_ACCOUNT_PRIVATE_KEY" : "OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
    console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH each is enough to start) to this wallet, prior to proceed.", LogC.reset);
    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "deployment completed with success.", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

