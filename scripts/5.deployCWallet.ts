// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { toBN, toHex } from "starknet/dist/utils/number";
import { starknet } from "hardhat";
import type { StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import LogC from "../src/logColors";


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    switch (whichNetwork) {
        case "devnet":
            // Recovery of data of predeployed wallets in devnet
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            // Define Parent Wallet.
            const accountParent = await starknet.getAccountFromAddress(
                ListOfWallet[0].address,
                ListOfWallet[0].private_key,
                "OpenZeppelin"
            );
            // Define Game Wallet.
            const accountGame = await starknet.getAccountFromAddress(
                ListOfWallet[1].address,
                ListOfWallet[1].private_key,
                "OpenZeppelin"
            );
            // deploy ERC20 ECU contract.
            // 1. declare ECU class contract
            // 2. deploy the deployer of ECU contract
            // 3. ask to the deployer to deploy a new instance of ECU class contract
            // 4. recover the address of this new instance

            // declare ECU contract
            const contractFactoryERC20 = await starknet.getContractFactory("contracts/openzeppelin/token/erc20/presets/ERC20.cairo");
            const classHashECU = await accountParent.declare(contractFactoryERC20);
            // deploy .... deployer !
            const deployerFactory = await starknet.getContractFactory("myUniversalDeployer");
            const deployer = await deployerFactory.deploy({}, { salt: "0x00" });
            const deployerAddress = toHex(toBN(deployer.address)); // remove 0s after 0x if necessary, to have no problem with Events filter.
            console.log("✅ ECU deployer address=", deployerAddress)
            // deploy instance of ECU class contract
            const initialS: Uint256 = bnToUint256(10000);
            //Constructor ERC20 ECU : name: felt, symbol: felt, decimals: felt, initial_supply: Uint256, recipient: felt
            const constructorECU: StringMap = { class_hash: BigInt(classHashECU), params: [starknet.shortStringToBigInt("ECU token"), starknet.shortStringToBigInt("ECU"), 2n, initialS.low, initialS.high, accountParent.address] };
            const estimatedFee = await accountParent.estimateFee(
                deployer,
                "deploy_contract",
                constructorECU
            );
            const deploymentHash = await accountParent.invoke(deployer, "deploy_contract", constructorECU, { maxFee: estimatedFee.amount * 2n });
            // recover ECU instance address
            const receipt = await starknet.getTransactionReceipt(deploymentHash);
            const deploymentEvent = receipt.events.filter(i => i.from_address === deployerAddress)[0];//catch first event emited by the ECU deployer
            const ECUdeploymentAddress = deploymentEvent.data[0];
            const contractECU = contractFactoryERC20.getContractAt(ECUdeploymentAddress);
            console.log("✅ ERC20 ECU instance deployed to:", contractECU.address, "\n✅")
            //
            // deploy specific Children Wallet

            break;
        case "integratedDevnet":
            throw new Error("IntegratedDevnet not authorized!")
            break;
        case undefined:
            throw new Error("Network not defined!")
            break;
        default: //testnet goerli or mainnet ETH

            break;
    }
    // Recovery of data of predeployed wallets in devnet
    const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    // Define Parent Wallet.
    const accountParent = await starknet.getAccountFromAddress(
        ListOfWallet[0].address,
        ListOfWallet[0].private_key,
        "OpenZeppelin"
    );
    // Define Game Wallet.
    const accountGame = await starknet.getAccountFromAddress(
        ListOfWallet[1].address,
        ListOfWallet[1].private_key,
        "OpenZeppelin"
    );
    // deploy ERC20 ECU contract.
    // 1. declare ECU class contract
    // 2. deploy the deployer of ECU contract
    // 3. ask to the deployer to deploy a new instance of ECU class contract
    // 4. recover the address of this new instance

    // declare ECU contract
    const contractFactoryERC20 = await starknet.getContractFactory("contracts/openzeppelin/token/erc20/presets/ERC20.cairo");
    const classHashECU = await accountParent.declare(contractFactoryERC20);
    // deploy .... deployer !
    const deployerFactory = await starknet.getContractFactory("myUniversalDeployer");
    const deployer = await deployerFactory.deploy({}, { salt: "0x00" });
    const deployerAddress = toHex(toBN(deployer.address)); // remove 0s after 0x if necessary, to have no problem with Events filter.
    console.log("✅ ECU deployer address=", deployerAddress)
    // deploy instance of ECU class contract
    const initialS: Uint256 = bnToUint256(10000);
    //Constructor ERC20 ECU : name: felt, symbol: felt, decimals: felt, initial_supply: Uint256, recipient: felt
    const constructorECU: StringMap = { class_hash: BigInt(classHashECU), params: [starknet.shortStringToBigInt("ECU token"), starknet.shortStringToBigInt("ECU"), 2n, initialS.low, initialS.high, accountParent.address] };
    const estimatedFee = await accountParent.estimateFee(
        deployer,
        "deploy_contract",
        constructorECU
    );
    const deploymentHash = await accountParent.invoke(deployer, "deploy_contract", constructorECU, { maxFee: estimatedFee.amount * 2n });
    // recover ECU instance address
    const receipt = await starknet.getTransactionReceipt(deploymentHash);
    const deploymentEvent = receipt.events.filter(i => i.from_address === deployerAddress)[0];//catch first event emited by the ECU deployer
    const ECUdeploymentAddress = deploymentEvent.data[0];
    const contractECU = contractFactoryERC20.getContractAt(ECUdeploymentAddress);
    console.log("✅ ERC20 ECU instance deployed to:", contractECU.address, "\n✅")
    //
    // deploy specific Children Wallet


    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "deployment completed with success", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

