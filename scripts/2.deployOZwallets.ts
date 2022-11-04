// deployOZwallet.ts
// deploy Parent and game wallets in Alpha testnet.
// Automatically deployed in devnet.
import { starknet } from "hardhat";
import hre from "hardhat";
import { adaptAddress } from "../src/util";
import LogC from "../src/logColors";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nCreation of Parent wallet in progres...");
    switch (whichNetwork) {
        case "alpha"://testnet goerli ETH
            // const parentAccount = await starknet.deployAccount("OpenZeppelin");
            // const parentAccountAddress = adaptAddress(parentAccount.address);
            // const parentAccountPrivateKey = parentAccount.privateKey;
            // console.log("✅ Parent wallet address=", parentAccountAddress, "\nCopy/Paste this address in src/const.ts, in varName addrParentAlpha", "\n  wallet private key=", parentAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName OZ_PARENT_ACCOUNT_PRIVATE_KEY\n\nCreation of game wallet in progres...");
            const gameAccount = await starknet.deployAccount("OpenZeppelin");
            const gameAccountAddress = adaptAddress(gameAccount.address);
            const gameAccountPrivateKey = gameAccount.privateKey;
            console.log("✅ Game wallet address=", gameAccountAddress, "\nCopy/Paste this address in src/const.ts, in varName addrGameAlpha", "\n  wallet private key=", gameAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName OZ_GAME_ACCOUNT_PRIVATE_KEY");
            console.log("⚠️ ", LogC.fg.green, "Send some Goerli ETH (0.01 ETH each is enough to start) to these 2 wallets, prior to proceed to next items", LogC.reset);
            break;
        default:
            throw new Error("IntegratedDevnet, devnet and mainnet not authorized for this script!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

