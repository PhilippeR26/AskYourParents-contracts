// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import hre from "hardhat";
import type { StarknetContract, StarknetContractFactory, Account } from "hardhat/types/runtime";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import LogC from "../src/logColors";
import { starknet } from "hardhat";
import { AAccount } from "hardhat";
import { adaptAddress } from "../src/util";
import { type OZaccountAA } from "../src/HHstarknetAbstractAccount/accountAA";
import * as dotenv from 'dotenv';
import { addrAdminAlpha, addrAdminAlpha2, addrChildrenAlpha, addrChildrenAlpha2, addrChildrenDevnet, addrGameAlpha, addrGameAlpha2, addrParentAlpha, addrParentAlpha2 } from "../src/const";
import { ensureEnvVar } from "../src/util";
import axios from "axios";
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    // ********* Open all accounts *******
    let parentAccount: Account;
    let gameAccount: Account;
    let adminAccount: Account;
    let childrenAccount: OZaccountAA;

    switch (whichNetwork) {
        case "devnet":
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            parentAccount = await starknet.getAccountFromAddress(
                ListOfWallet[0].address,
                ListOfWallet[0].private_key,
                "OpenZeppelin"
            );
            gameAccount = await starknet.getAccountFromAddress(
                ListOfWallet[1].address,
                ListOfWallet[1].private_key,
                "OpenZeppelin"
            );
            adminAccount = await starknet.getAccountFromAddress(
                ListOfWallet[2].address,
                ListOfWallet[2].private_key,
                "OpenZeppelin"
            );
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenDevnet, ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"), "ChildrenAA");
            break;
        case "alpha":
            parentAccount = await starknet.getAccountFromAddress(
                addrParentAlpha,
                ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            gameAccount = await starknet.getAccountFromAddress(
                addrGameAlpha,
                ensureEnvVar("OZ_GAME_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            adminAccount = await starknet.getAccountFromAddress(
                addrAdminAlpha,
                ensureEnvVar("OZ_ADMIN_ACCOUNT_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha, ensureEnvVar("OZ_CHILDREN_ACCOUNT_PRIVATE_KEY"), "ChildrenAA");
            break;
        case "alpha-goerli-2":
            parentAccount = await starknet.getAccountFromAddress(
                addrParentAlpha2,
                ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            gameAccount = await starknet.getAccountFromAddress(
                addrGameAlpha2,
                ensureEnvVar("OZ_GAME_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            adminAccount = await starknet.getAccountFromAddress(
                addrAdminAlpha2,
                ensureEnvVar("OZ_ADMIN_ACCOUNT2_PRIVATE_KEY"),
                "OpenZeppelin"
            );
            childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha2, ensureEnvVar("OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY"), "ChildrenAA");
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");
    const childrenContract = ChildrenAAFactory.getContractAt(childrenAccount.address);
    // ******* recover metadata of Children Account
    const childrenAccountAddress = adaptAddress(childrenAccount.address);
    const childrenAccountPrivateKey = childrenAccount.privateKey;
    // get super admninstrator address
    const { super_admin_addr: addrBigInt } = await childrenContract.call("get_super_admin");
    const childrenAccountSuperAdminAddress: string = "0x" + addrBigInt.toString(16);
    console.log("✅ Children wallet address=", childrenAccountAddress);
    console.log("\n  Children wallet private key=", childrenAccountPrivateKey);
    console.log("Super admin address =", childrenAccountSuperAdminAddress, "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

