// deploy the 3 argentX wallets in devnet
// Launch with npx hardhat run scripts/6.deployArgentWallet.ts
import hre from "hardhat";
import LogC from "../src/logColors";
import { starknet } from "hardhat";
import { adaptAddress, ensureEnvVar } from "../src/util";
import { Account, OZaccountAA } from "../src/HHstarknetAbstractAccount/accountAA";
import * as dotenv from 'dotenv';
import { addrArgentXWallet1_devnet, addrParentAlpha, addrParentAlpha2 } from "../src/const";
import axios from "axios";
import { MyAccountChildren } from "./AAaccount";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import { StarknetContractFactory } from "hardhat/types";
import { ArgentAccount, OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);

    let parentAccountAddress: string;
    let parentAccount: OpenZeppelinAccount;
    let myChildrenAccount: MyAccountChildren;
    let contractFactory: StarknetContractFactory;
    switch (whichNetwork) {
        case "devnet":
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            parentAccountAddress = ListOfWallet[0].address;
            parentAccount = await starknet.OpenZeppelinAccount.getAccountFromAddress(ListOfWallet[0].address, ListOfWallet[0].private_key);

            // contractFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
            // console.log("declaration of contract account...");
            // const classHash = await parentAccount.declare(contractFactory);
            // console.log("classHash =", classHash);

            // const signer = generateKeys(ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"));
            // const salt = signer.publicKey;
            // const pubKey = signer.publicKey;
            // const pubKeyNum = BigInt(pubKey).toString()
            // console.log("account pubKey =", pubKey);
            // console.log("account pubKeyNum =", pubKeyNum);
            // const privKey = signer.privateKey;
            // console.log("account private key =", privKey);

            // const constructorAccount = [
            //     BigInt(parentAccount.address).toString(), // superadmin
            //     BigInt(pubKey).toString()
            // ];

            // myChildrenAccount = await MyAccountChildren.createAccount(constructorAccount, { classH: classHash, salt: pubKey, privateKey: privKey });
            //console.log("myAccount.address =", myChildrenAccount.address);
            // fund the account before deploying it
            //const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": myChildrenAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
            //console.log('Answer mint =', answer);

            // ...
            //const deploymentTxHash = await myChildrenAccount.deployAccount({ maxFee: 9_000_000_000_000_000 });


            //console.log("\n✅ AAccount deployed at = " + LogC.fg.green + myChildrenAccount.address + LogC.reset);

            break;
        default:
            throw new Error("Only devnet authorized for this script!");
    }
    const contractFactoryAXproxy = await starknet.getContractFactory("starknet-artifacts/contracts/upgrade/Proxy.cairo");
    //const contractFactoryAXaccount = await starknet.getContractFactory("starknet-artifacts/contracts/ArgentX/account/ArgentAccount.cairo");
    const classHashAXproxy = await parentAccount.declare(contractFactoryAXproxy, { maxFee: 900_000_000_000_000 });// as Fee of Declare function can't be estimated, let's jump in with a rough and over-evaluated value....
    console.log("classHashAXproxy =", classHashAXproxy);
    // const classHashAXaccount = await parentAccount.declare(contractFactoryAXaccount, { maxFee: 900_000_000_000_000 });
    // console.log("classHashAXaccount =", classHashAXaccount);
    //const parentAccountAX = await starknet.ArgentAccount.getAccountFromAddress(addrArgentXWallet1_devnet, ensureEnvVar("ARGENTX_AC1_DEVNET_PRIVATE_KEY"));
    //console.log("parentAccountAX address =", parentAccountAX.address, " ", parentAccountAX.privateKey);




    //const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": myChildrenAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });


    //console.log(" =",childrenAccount.)
    // const childrenAccountAddress = adaptAddress(childrenAccount.address);
    // const childrenAccountPrivateKey = childrenAccount.privateKey;
    // get super admninstrator address
    //const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");

    // test ouverture compte existant
    // const existingChildrenAccount = await MyAccountChildren.getAccountFromAddress(myChildrenAccount.address, myChildrenAccount.privateKey);

    // const existingChildrenContract = contractFactory.getContractAt(myChildrenAccount.address);
    // const { super_admin_addr: addrBigInt } = await existingChildrenContract.call("get_super_admin");
    // const childrenAccountSuperAdminAddress: string = "0x" + addrBigInt.toString(16);


    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "Deployment completed with success.", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

