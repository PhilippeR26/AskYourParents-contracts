// deployDeployer.ts
// deploy my Universal Deployer of Cairo Class Contracts.
// 
import { starknet } from "hardhat";
import hre from "hardhat";
import { adaptAddress, ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import { Account } from "hardhat/types";
import { addrParentAlpha } from "../src/const";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
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
        case "alpha"://testnet goerli ETH
            // Recovery of data of Parent predeployed wallet in Alpha testnet
            accountParent = await starknet.getAccountFromAddress(
                addrParentAlpha,
                ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    // deploy .... UniversalDeployer !
    const deployerFactory = await starknet.getContractFactory("deployer/myUniversalDeployer");
    const deployer = await deployerFactory.deploy({}, { salt: "0x00" });
    const deployerAddress = adaptAddress(deployer.address); // remove 0s after 0x if necessary, to have no problem with Events filter.
    console.log("✅ ECU deployer address=", deployerAddress, "\nCopy/Paste this address in src/const.ts, in varName ", whichNetwork === "devnet" ? "addrDeployerDevnet" : "addrDeployerAlpha");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

