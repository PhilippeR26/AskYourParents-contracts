// testBB.ts
// deploy an account abstraction.
// Automatically deployed in devnet.
import { starknet } from "hardhat";
//import hre from "hardhat";
import LogC from "../src/logColors";
import { MyAccountSimple } from "./AAaccount"
import { Call, hash, RawCalldata, number } from "starknet";
import axios from "axios";

import { adaptAddress } from "../src/util";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import { StarknetContract } from "hardhat/types";
import { Account } from "../src/HHstarknetAbstractAccount/accountAA";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const hre = await import("hardhat");
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network : " + LogC.fg.yellow + whichNetwork, LogC.reset, "\nConnect predeployed wallet 0.");
    const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    const parentAccount = await starknet.OpenZeppelinAccount.getAccountFromAddress(
        ListOfWallet[0].address,
        ListOfWallet[0].private_key
    );

    //creation account OZ
    console.log("Creation of OZ account");
    const accountOZ = await starknet.OpenZeppelinAccount.createAccount();
    console.log("accountOZ.address =", accountOZ.address);
    const { data: answerOZ } = await axios.post('http://127.0.0.1:5050/mint', { "address": accountOZ.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    await accountOZ.deployAccount();

    // creation AAacount
    // if never declared in the network :
    const contractFactory = await hre.starknet.getContractFactory(MyAccountSimple.MYACCOUNTPATH);
    console.log("declaration of contract");
    const classHash = await parentAccount.declare(contractFactory);
    console.log("classHash =", classHash);


    const signer = generateKeys("0x12345789012345678901234");
    const salt = signer.publicKey;
    const pubKey = signer.publicKey;
    const pubKeyNum = BigInt(pubKey).toString()
    console.log("account pubKey =", pubKey);
    console.log("account pubKeyNum =", pubKeyNum);
    const privKey = signer.privateKey;
    console.log("account private key =", privKey);

    // const addressAccount = hash.calculateContractAddressFromHash(salt, classHash, [signer.publicKey], "0x0");
    // console.log("account address =", addressAccount);
    //const Mycontract: StarknetContract = contractFactory.getContractAt(addressAccount);

    const constructorAccount = [
        BigInt(parentAccount.address).toString(),
        BigInt(pubKey).toString()
    ];

    const myAccount = await MyAccountSimple.createAccount(constructorAccount, { classH: classHash, salt: pubKey, privateKey: privKey });
    console.log("myAccount.address =", myAccount.address);
    // fund the account before deploying it
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": myAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);

    // ...
    const deploymentTxHash = await myAccount.deployAccount({ maxFee: 9000000000000000 });


    console.log("\n✅ AAccount deployed at = " + LogC.fg.green + myAccount.addressAccount + LogC.reset);

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

