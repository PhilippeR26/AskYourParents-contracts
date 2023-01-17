// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import hre from "hardhat";
import LogC from "../src/logColors";
import { starknet } from "hardhat";
import { adaptAddress, ensureEnvVar } from "../src/util";
import { Account, OZaccountAA } from "../src/HHstarknetAbstractAccount/accountAA";
import * as dotenv from 'dotenv';
import { addrParentAlpha, addrParentAlpha2 } from "../src/const";
import axios from "axios";
import { MyAccountSimple } from "./AAaccount";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import { StarknetContractFactory } from "hardhat/types";
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    // deploy Children Account
    let parentAccountAddress: string;
    let myChildrenAccount: MyAccountSimple;
    let contractFactory: StarknetContractFactory;
    switch (whichNetwork) {
        case "devnet":
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            parentAccountAddress = ListOfWallet[0].address;
            const parentAccount = await starknet.OpenZeppelinAccount.getAccountFromAddress(ListOfWallet[0].address, ListOfWallet[0].private_key);

            contractFactory = await hre.starknet.getContractFactory(MyAccountSimple.MYACCOUNTPATH);
            console.log("declaration of contract account...");
            const classHash = await parentAccount.declare(contractFactory);
            console.log("classHash =", classHash);

            const signer = generateKeys(ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"));
            const salt = signer.publicKey;
            const pubKey = signer.publicKey;
            const pubKeyNum = BigInt(pubKey).toString()
            console.log("account pubKey =", pubKey);
            console.log("account pubKeyNum =", pubKeyNum);
            const privKey = signer.privateKey;
            console.log("account private key =", privKey);

            const constructorAccount = [
                BigInt(parentAccount.address).toString(), // superadmin
                BigInt(pubKey).toString()
            ];

            myChildrenAccount = await MyAccountSimple.createAccount(constructorAccount, { classH: classHash, salt: pubKey, privateKey: privKey });
            //console.log("myAccount.address =", myChildrenAccount.address);
            // fund the account before deploying it
            const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": myChildrenAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
            console.log('Answer mint =', answer);

            // ...
            const deploymentTxHash = await myChildrenAccount.deployAccount({ maxFee: 9_000_000_000_000_000 });


            console.log("\n✅ AAccount deployed at = " + LogC.fg.green + myChildrenAccount.address + LogC.reset);

            break;
        // case "alpha":
        //     parentAccountAddress = addrParentAlpha;
        //     //childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { super_admin_address: parentAccountAddress });
        //     break;
        // case "alpha-goerli-2":
        //     parentAccountAddress = addrParentAlpha2;
        //     //childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { super_admin_address: parentAccountAddress });
        //     break;
        default:
            throw new Error("Only devnet authorized for this script!");
    }
    //console.log(" =",childrenAccount.)
    // const childrenAccountAddress = adaptAddress(childrenAccount.address);
    // const childrenAccountPrivateKey = childrenAccount.privateKey;
    // get super admninstrator address
    //const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");

    // test ouverture compte existant
    const existingChildrenAccount = await MyAccountSimple.getAccountFromAddress(myChildrenAccount.address, myChildrenAccount.privateKey);

    const existingChildrenContract = contractFactory.getContractAt(myChildrenAccount.address);
    const { super_admin_addr: addrBigInt } = await existingChildrenContract.call("get_super_admin");
    const childrenAccountSuperAdminAddress: string = "0x" + addrBigInt.toString(16);

    // console.log("✅ Children wallet address=", myChildrenAccount.address, "\n  Copy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrChildrenAlpha2" : whichNetwork === "alpha" ? "addrChildrenAlpha" : "addrChildrenDevnet");
    // console.log("\n  Children wallet private key=", childrenAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY" : whichNetwork === "alpha" ? "OZ_CHILDREN_ACCOUNT_PRIVATE_KEY" : "OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
    console.log("✅ Children wallet address=", myChildrenAccount.address, "\n  Copy/Paste this address in src/const.ts, in varName addrChildrenDevnet");
    console.log("\n  Children wallet private key =", myChildrenAccount.privateKey, "\nCopy/Paste this key in .env file, in varName OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
    console.log("Super admin address =", childrenAccountSuperAdminAddress, BigInt(childrenAccountSuperAdminAddress).toString());
    if (whichNetwork != "devnet") { console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH is enough to start) to this wallet, prior to proceed.", LogC.reset); }
    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "Deployment completed with success.", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

