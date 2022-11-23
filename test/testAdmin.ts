import { expect } from "chai";
import hre, { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Account } from "hardhat/types/runtime";
import { addrChildrenAlpha, addrChildrenAlpha2, addrChildrenDevnet, addrGameAlpha, addrGameAlpha2, addrParentAlpha, TIMEOUT } from "../src/const";
import { ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import { toHex } from "starknet/dist/utils/number";
//import {type BN} from "bn.js";
import * as dotenv from 'dotenv';
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
//import { StarknetContract, StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
dotenv.config({ path: "../.env" });

describe("Test of Children Account-administrators", function () {
    this.timeout(TIMEOUT);
    let accountParent: Account;
    let accountGame: Account;
    let childrenAccount: Account;
    let childrenContract: StarknetContract;
    before(async function () {
        const whichNetwork = hre.config.starknet.network;
        console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nAccounts opening in progres ...");
        switch (whichNetwork) {
            case "devnet":
                // Recovery of data of predeployed wallets in devnet
                const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
                accountParent = await starknet.getAccountFromAddress(
                    ListOfWallet[3].address,
                    ListOfWallet[3].private_key,
                    "OpenZeppelin"
                );
                accountGame = await starknet.getAccountFromAddress(
                    ListOfWallet[1].address,
                    ListOfWallet[1].private_key,
                    "OpenZeppelin"
                );
                childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenDevnet, ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"), "ChildrenAA");
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
                childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha, ensureEnvVar("OZ_CHILDREN_ACCOUNT_PRIVATE_KEY"), "ChildrenAA");
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
                childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha2, ensureEnvVar("OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY"), "ChildrenAA");
                break;
            default:
                throw new Error("IntegratedDevnet not authorized for this script!")
        }
        const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/ChildrenAccount.cairo");
        childrenContract = ChildrenAAFactory.getContractAt(childrenAccount.address);
    })


    it("should fail. Not allowed to add admin without first init.", async function () {
        try {
            await accountParent.invoke(childrenContract, "add_admin", { address: accountParent.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed.");
        } catch (err: any) {
            console.error(err.message);
            expect(err.message).to.contain("assert first_admin = FALSE");
        }
    })

    it("Should succeed. Defining 1st admin.", async function () {
        await accountParent.invoke(childrenContract, "def_first_admin", { address: accountParent.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountParent.address });
        expect(result).to.be.equal(1n);
    })
    it("should succeed. add admin after first init.", async function () {
        await accountParent.invoke(childrenContract, "add_admin", { address: accountParent.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountParent.address });
        expect(result).to.be.equal(1n);
    })
    it("should fail. Not allowed to add admin with address 0.", async function () {
        try {
            await accountParent.invoke(childrenContract, "add_admin", { address: "0x00" }, { maxFee: 900_000_000_000_000 });
            expect.fail("Should fail");
        } catch (err: any) {
            expect(err.message).to.contain("assert_not_zero(addr_admin)");
        }
    })
    it("should fail. Not allowed to add admin when not admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "add_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Should fail");
        } catch (err: any) {
            expect(err.message).to.contain("assert_only_admin()");
        }
    })
    it("should succeed. add 2nd admin.", async function () {
        await accountParent.invoke(childrenContract, "add_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountGame.address });
        expect(result).to.be.equal(1n);
    })
    it("should fail. Not allowed to self remove its admin rights.", async function () {
        try {
            await accountGame.invoke(childrenContract, "remove_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Should fail");
        } catch (err: any) {
            expect(err.message).to.contain("assert_not_equal(caller, addr_admin)");
        }
    })
    it("should fail. Not allowed to remove non admin address.", async function () {
        try {
            await accountParent.invoke(childrenContract, "remove_admin", { address: "0x123" }, { maxFee: 900_000_000_000_000 });
            expect.fail("Should fail");
        } catch (err: any) {
            expect(err.message).to.contain("assert is_admin = TRUE");
        }
    })
    it("should fail. Only admin can remove admin rights.", async function () {
        try {
            await childrenAccount.invoke(childrenContract, "remove_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Should fail");
        } catch (err: any) {
            expect(err.message).to.contain("assert_only_admin()");
        }
    })
    it("should succeed. Remove admin.", async function () {
        await accountParent.invoke(childrenContract, "remove_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountGame.address });
        expect(result).to.be.equal(0n);
    })


});

