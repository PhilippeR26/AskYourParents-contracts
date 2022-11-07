// deployDeployer.ts
// deploy my Universal Deployer of Cairo Class Contracts.
// 
import { starknet } from "hardhat";
import hre from "hardhat";
import { adaptAddress } from "../src/util";
import LogC from "../src/logColors";
import { StarknetContract } from "hardhat/types";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nDeployement of myUniversalDeployer in progress...");
    // deploy .... UniversalDeployer !
    const deployerFactory = await starknet.getContractFactory("deployer/myUniversalDeployer");
    let deployer: StarknetContract;
    switch (whichNetwork) {
        case "devnet":
            deployer = await deployerFactory.deploy({}, { salt: "0x00" });
            break;
        case "alpha": case "alpha-goerli-2"://testnet goerli ETH
            deployer = await deployerFactory.deploy({});
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    const deployerAddress = adaptAddress(deployer.address); // remove 0s after 0x if necessary, to have no problem with Events filter.
    console.log("✅ myUniversalDeployer address=", deployerAddress, "\nCopy/Paste this address in src/const.ts, in varName", whichNetwork === "devnet" ? "addrDeployerDevnet" : whichNetwork === "alpha" ? "addrDeployerAlpha" : "addrDeployerAlpha2");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

