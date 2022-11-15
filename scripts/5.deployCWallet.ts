// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import hre from "hardhat";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import { adaptAddress } from "../src/util";
import { Account } from "../src/HHstarknetAbstractAccount/accountAA";


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    let childrenAccount: Account;
    switch (whichNetwork) {
        case "devnet":
            childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { salt: "0x00", privateKey: "0x01" });
            break;
        case "alpha": case "alpha-goerli-2":
            childrenAccount = await AAccount.deployAccountAA("ChildrenAA");
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    const childrenAccountAddress = adaptAddress(childrenAccount.address);
    const childrenAccountPrivateKey = childrenAccount.privateKey;

    console.log("✅ Children wallet address=", childrenAccountAddress, "\n  Copy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrChildrenAlpha2" : whichNetwork === "alpha" ? "addrChildrenAlpha" : "addrChildrenDevnet");
    console.log("\n  wallet private key=", childrenAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY" : whichNetwork === "alpha" ? "OZ_CHILDREN_ACCOUNT_PRIVATE_KEY" : "OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
    console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH each is enough to start) to this wallet, prior to proceed.", LogC.reset);
    if (whichNetwork === "devnet") { console.log(LogC.fg.green, "type '", LogC.bright, "source ./scripts/mintWallet.sh", LogC.dim, "' to feed your Children Account on devnet. ", LogC.reset) };
    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "deployment completed with success.", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

