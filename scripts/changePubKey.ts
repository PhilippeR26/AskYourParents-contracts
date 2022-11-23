// This script shows how to change the public key of an OZ wallet. By this way, you can change the owner of a wallet.
import hre, { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Account } from "hardhat/types/runtime";
import { addrChildrenAlpha, addrChildrenAlpha2, addrChildrenDevnet, addrGameAlpha, addrGameAlpha2, addrParentAlpha } from "../src/const";
import { ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";

import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

async function main() {
    let accountParent: Account;
    let accountGame: Account;
    let childrenAccount: Account;
    let childrenContract: StarknetContract;
    let restorePrivKey: string;
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nAccounts opening in progres ...");
    switch (whichNetwork) {
        case "devnet":
            // Recovery of data of predeployed wallets in devnet
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            accountParent = await starknet.getAccountFromAddress(
                ListOfWallet[0].address,
                ListOfWallet[0].private_key,
                "OpenZeppelin"
            );
            accountGame = await starknet.getAccountFromAddress(
                ListOfWallet[1].address,
                ListOfWallet[1].private_key,
                "OpenZeppelin"
            );
            restorePrivKey = ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenDevnet, restorePrivKey, "ChildrenAA");
            //childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenDevnet, "0x123", "ChildrenAA");
            break;
        case "alpha"://testnet alpha goerli ETH
            accountParent = await starknet.getAccountFromAddress(
                addrParentAlpha,
                ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            accountGame = await starknet.getAccountFromAddress(
                addrGameAlpha,
                ensureEnvVar("OZ_GAME_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            restorePrivKey = ensureEnvVar("OZ_CHILDREN_ACCOUNT_PRIVATE_KEY");
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha, restorePrivKey, "ChildrenAA");
            break;
        case "alpha-goerli-2"://testnet alpha 2 goerli ETH
            accountParent = await starknet.getAccountFromAddress(
                addrGameAlpha2,
                ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            accountGame = await starknet.getAccountFromAddress(
                addrGameAlpha2,
                ensureEnvVar("OZ_GAME_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            restorePrivKey = ensureEnvVar("OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY");
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha2, restorePrivKey, "ChildrenAA");
            break;
        default:
            throw new Error("IntegratedDevnet not authorized for this script!")
    }
    const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");
    childrenContract = ChildrenAAFactory.getContractAt(childrenAccount.address);

    //current situation
    const { publicKey: pubKeyChildren } = await childrenContract.call("getPublicKey");
    console.log("privKeyChildren =", childrenAccount.privateKey);
    console.log("childrenAccount.publicKey =", childrenAccount.publicKey);
    console.log("pubKeyChildren = 0x" + pubKeyChildren.toString(16) + "\n");
    // change keys
    const newSigner = generateKeys("0x123");
    console.log("expected pubkey =", newSigner.publicKey);
    await childrenAccount.invoke(childrenContract, "setPublicKey", { newPublicKey: newSigner.publicKey }, { maxFee: 900_000_000_000_000 });
    const { publicKey: pubKeyChildren2 } = await childrenContract.call("getPublicKey");
    childrenAccount.privateKey = "0x123";
    childrenAccount.publicKey = "0x" + pubKeyChildren2.toString(16);
    childrenAccount.keyPair = newSigner.keyPair;
    console.log("After setPublicKey, privKeyChildren =", childrenAccount.privateKey);
    console.log("childrenAccount.publicKey =", childrenAccount.publicKey);
    console.log("pubKeyChildren2 = 0x" + pubKeyChildren2.toString(16));
    // restore to initial values
    const newSigner2 = generateKeys(restorePrivKey);
    console.log("Before restoring :\nexpected pubkey =", newSigner2.publicKey);
    await childrenAccount.invoke(childrenContract, "setPublicKey", { newPublicKey: newSigner2.publicKey }, { maxFee: 900_000_000_000_000 });
    const { publicKey: pubKeyChildren3 } = await childrenContract.call("getPublicKey");
    console.log("After restoring :\npubKeyChildren3 = 0x" + pubKeyChildren3.toString(16));

    //const fee = await accountParent.estimateFee(contract, "increase_balance", args);
    //await accountParent.invoke(childrenContract, "setPublicKey", {});




}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });