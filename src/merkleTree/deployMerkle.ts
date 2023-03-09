// deploy the check Merkle tree contract
// launch with npx hardhat run src/merkleTree/deployMerkle.ts
import { number, uint256 } from "starknet";
import { starknet } from "hardhat";
import type { Account, StarknetContract, StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import { adaptAddress, ensureEnvVar } from "../util";
import LogC from "../logColors";
import { addrArgentXWallet1_devnet, addrDeployerAlpha, addrDeployerAlpha2, addrDeployerDevnet, addrParentAlpha, addrParentAlpha2 } from "../const";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nDeployement of Contract in progress...");
    let accountParent: Account;
    switch (whichNetwork) {
        case "devnet":
            // Recovery of data of predeployed wallets in devnet
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            // Define Parent Wallet.
            accountParent = await starknet.OpenZeppelinAccount.getAccountFromAddress(ListOfWallet[0].address, ListOfWallet[0].private_key);
            break;
        case "alpha"://testnet alpha goerli ETH
            // Recovery of data of Parent predeployed wallet in Alpha testnet
            accountParent = await starknet.OpenZeppelinAccount.getAccountFromAddress(
                addrParentAlpha,
                ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY")
            );
            break;
        case "alpha-goerli-2"://testnet alpha 2 goerli ETH
            // Recovery of data of Parent predeployed wallet in Alpha testnet
            accountParent = await starknet.OpenZeppelinAccount.getAccountFromAddress(
                addrParentAlpha2,
                ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY")
            );
            break;
        default:
            throw new Error("IntegratedDevnet not authorized for this script!")
    }

    // deploy ERC20 ECU contract.
    // 1. declare ECU class contract
    // 2. ask to the deployer to deploy a new instance of ECU class contract
    // 4. recover the address of this new instance

    // 1. Declare ECU contract
    const contractFactory = await starknet.getContractFactory("contracts/merkle/merkle-verify.cairo");
    const classHash = await accountParent.declare(contractFactory, { maxFee: 900_000_000_000_000 });// as Fee of Declare function can't be estimated, let's jump in with a rough and over-evaluated value....
    console.log("✅ Contract class hash contract :", classHash, "\nCopy/Paste this class hash.\n");

    // 2. Deploy instance of contract
    const constructor: StringMap = {
        merkle_root: "0x1497b72c82b80429799fe65afa3edc5492ee848deba69418c474504792756a0"
    };

    const contract = await accountParent.deploy(contractFactory, constructor, { maxFee: 9_000_000_000_000_000, salt: "0x02" });




    // 3. Recover contract instance address
    const contractDeploymentAddress = contract.address;
    console.log("✅ Contract instance deployed to:", contractDeploymentAddress, "\n")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });
