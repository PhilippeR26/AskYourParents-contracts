// Test ChildrenAccount-management of admnistrators.
// 100 ECU are minted to the parent wallet.
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { starknet } from "hardhat";
import type { Account, StarknetContract, StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import { adaptAddress, ensureEnvVar } from "../../src/util";
import LogC from "../../src/logColors";
import { addrDeployerAlpha, addrDeployerAlpha2, addrDeployerDevnet, addrParentAlpha, addrParentAlpha2 } from "../../src/const";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nDeployement of ERC20 ECU in progress...");
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
        case "alpha"://testnet alpha goerli ETH
            // Recovery of data of Parent predeployed wallet in Alpha testnet
            accountParent = await starknet.getAccountFromAddress(
                addrParentAlpha,
                ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            break;
        case "alpha-goerli-2"://testnet alpha 2 goerli ETH
            // Recovery of data of Parent predeployed wallet in Alpha testnet
            accountParent = await starknet.getAccountFromAddress(
                addrParentAlpha2,
                ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
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
    const contractFactoryERC20 = await starknet.getContractFactory("contracts/openzeppelin/token/erc20/presets/ERC20Mintable.cairo");
    const classHashECU = await accountParent.declare(contractFactoryERC20, { maxFee: 900_000_000_000_000 });// as Fee of Declare function can't be estimated, let's jump in with a rough and over-evaluated value....
    console.log("✅ ERC20 ECU class hash contract :", classHashECU, "\nCopy/Paste this class hash in src/const.ts, in varName classHashECU\n");

    // deploy .... deployer !
    const deployerFactory = await starknet.getContractFactory("contracts/deployer/myUniversalDeployer");
    let deployerContract: StarknetContract;
    switch (whichNetwork) {
        case "devnet":
            deployerContract = await deployerFactory.getContractAt(addrDeployerDevnet);
            break;
        case "alpha"://testnet alpha goerli ETH
            deployerContract = await deployerFactory.getContractAt(addrDeployerAlpha);
            break;
        case "alpha-goerli-2"://testnet alpha 2 goerli ETH
            deployerContract = await deployerFactory.getContractAt(addrDeployerAlpha2);
            break;
    }

    // 2. Deploy instance of ECU class contract
    const initialS: Uint256 = bnToUint256(10000);
    //Constructor ERC20 ECU mintable : name: felt, symbol: felt, decimals: felt, initial_supply: Uint256, recipient: felt, owner: felt
    const constructorECU: StringMap = { class_hash: BigInt(classHashECU), params: [starknet.shortStringToBigInt("ECU token"), starknet.shortStringToBigInt("ECU"), 2n, initialS.low, initialS.high, accountParent.address, accountParent.address] };
    const estimatedFee = await accountParent.estimateFee(
        deployerContract,
        "deploy_contract",
        constructorECU
    );
    const deploymentHash = await accountParent.invoke(deployerContract, "deploy_contract", constructorECU, { maxFee: estimatedFee.amount * 2n });

    // 3. Recover ECU instance address
    const receipt = await starknet.getTransactionReceipt(deploymentHash);
    const deploymentEvent = receipt.events.filter(i => i.from_address === deployerContract.address)[0];//catch first event emited by the deployer
    const ECUdeploymentAddress = deploymentEvent.data[0];
    console.log("✅ ERC20 ECU instance deployed to:", ECUdeploymentAddress, "\nCopy/Paste this address in src/const.ts, in varName", whichNetwork === "devnet" ? "addrECUdevnet" : whichNetwork === "alpha" ? "addrECUalpha" : "addrECUalpha2", "\n")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });
