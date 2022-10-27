import { starknet } from "hardhat";
import env from "hardhat";
import type { StringMap } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { TransactionReceipt } from "hardhat/types";
import { toBN, toHex } from "starknet/dist/utils/number";

async function main() {
    // Recover the network name defined in the config file
    const whichNetwork = env.config.starknet.network;
    console.log("\nworking in network :", whichNetwork);

    // Recovery of data of predeployed wallets in devnet
    const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    // Define Parent Wallet.
    const accountParent = await starknet.getAccountFromAddress(
        ListOfWallet[0].address,
        ListOfWallet[0].private_key,
        "OpenZeppelin"
    );

    // deploy ERC20 ECU contract.
    // 1. declare ECU class contract
    // 2. deploy the deployer of ECU contract
    // 3. ask to the deployer to deploy a new instance of ECU class contract
    // 4. recover the address of this new instance

    // declare ECU contract
    const contractFactoryECU = await starknet.getContractFactory("contracts/openzeppelin/token/erc20/presets/ERC20.cairo");
    const classHashECU = await accountParent.declare(contractFactoryECU);
    // deploy .... deployer !
    const deployerFactory = await starknet.getContractFactory("deployer");
    const deployer = await deployerFactory.deploy(
        { class_hash: classHashECU },
        { salt: "0x43" }
    );
    const deployerAddress = toHex(toBN(deployer.address)); // remove 0s after 0x if necessary, to have no problem with Events filter.
    console.log("ECU deployer address=", deployerAddress)
    // deploy instance of ECU class contract
    const initialS: Uint256 = bnToUint256(10000);
    //Constructor ERC20 ECU : name: felt, symbol: felt, decimals: felt, initial_supply: Uint256, recipient: felt
    const constructorECU: StringMap = { params: [starknet.shortStringToBigInt("ECU token"), starknet.shortStringToBigInt("ECU"), 2n, initialS.low, initialS.high, ListOfWallet[0].address] };
    const estimatedFee = await accountParent.estimateFee(
        deployer,
        "deploy_contract",
        constructorECU
    );
    const deploymentHash = await accountParent.invoke(deployer, "deploy_contract", constructorECU, { maxFee: estimatedFee.amount * 2n });
    const receipt: TransactionReceipt = await starknet.getTransactionReceipt(deploymentHash);
    const deploymentEvent = receipt.events.filter(i => i.from_address === deployerAddress)[0];//catch first event emits by the ECU deployer
    const ECUdeploymentAddress = deploymentEvent.data[0];
    const contractECU = contractFactoryECU.getContractAt(ECUdeploymentAddress);
    console.log("ERC20 ECU instance deployed to:", contractECU.address, "\ndeployment completed with success");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

