// deployOZwallet.ts
// deploy Parent and game wallets in Alpha testnet.
// Automatically deployed in devnet.
import hre, { starknet } from "hardhat";
import { adaptAddress } from "../src/util";
import LogC from "../src/logColors";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nCreation of Parent wallet in progress...");
    switch (whichNetwork) {
        case "alpha": case "alpha-goerli-2"://testnet goerli ETH
            // Parent Wallet
            const parentAccount = await starknet.deployAccount("OpenZeppelin");
            const parentAccountAddress = adaptAddress(parentAccount.address);
            const parentAccountPrivateKey = parentAccount.privateKey;
            console.log("✅ Parent wallet address=", parentAccountAddress, "\nCopy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrParentAlpha2" : "addrParentAlpha", "\n  wallet private key=", parentAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_PARENT_ACCOUNT2_PRIVATE_KEY" : "OZ_PARENT_ACCOUNT_PRIVATE_KEY", "\n\nCreation of game wallet in progress...");
            // Game wallet
            const gameAccount = await starknet.deployAccount("OpenZeppelin");
            const gameAccountAddress = adaptAddress(gameAccount.address);
            const gameAccountPrivateKey = gameAccount.privateKey;
            console.log("✅ Game wallet address=", gameAccountAddress, "\nCopy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrGameAlpha2" : "addrGameAlpha", "\n  wallet private key=", gameAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_GAME_ACCOUNT2_PRIVATE_KEY" : "OZ_GAME_ACCOUNT_PRIVATE_KEY");
            console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH each is enough to start) to these 2 wallets, prior to proceed to next items", LogC.reset);
            // admin wallet
            const adminAccount = await starknet.deployAccount("OpenZeppelin");
            const adminAccountAddress = adaptAddress(adminAccount.address);
            const adminAccountPrivateKey = adminAccount.privateKey;
            console.log("✅ Admin wallet address=", adminAccountAddress, "\nCopy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrAdminAlpha2" : "addrAdminAlpha", "\n  wallet private key=", adminAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_ADMIN_ACCOUNT2_PRIVATE_KEY" : "OZ_ADMIN_ACCOUNT_PRIVATE_KEY");
            console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH each is enough to start) to these 3 wallets, prior to proceed to next items", LogC.reset);
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

