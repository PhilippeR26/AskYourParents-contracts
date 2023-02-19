// for children administrtors functions
// launch with : npx hardhat test test/testAdmin.ts

import { expect } from "chai";
import hre, { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { addrArgentXWallet, addrArgentXWallet4_A1, addrArgentXWallet5_A1, addrArgentXWallet6_A1, TIMEOUT } from "../src/const";
import { ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
//import { AAccount } from "hardhat";
import { MyAccountChildren } from "../scripts/AAaccount";
import { Account, ec, Provider, stark } from "starknet";
import * as dotenv from 'dotenv';
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import axios from "axios";
import { ArgentAccount, OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import BN from "bn.js";
dotenv.config({ path: ".env" });


describe("Test of Children Account-administrators :", function () {
    this.timeout(TIMEOUT);
    let accountParent: OpenZeppelinAccount | ArgentAccount;
    let accountGame: OpenZeppelinAccount | ArgentAccount;
    let accountAdmin: OpenZeppelinAccount | ArgentAccount;
    let childrenAccount: MyAccountChildren;
    let childrenContract: StarknetContract;
    let contractChildrenFactory: StarknetContractFactory;
    before(async function () {
        const whichNetwork = hre.config.starknet.network;
        console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nAccounts opening in progress ...");
        switch (whichNetwork) {
            case "devnet":
                // Recovery of data of predeployed wallets in devnet
                const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
                accountParent = await starknet.OpenZeppelinAccount.getAccountFromAddress(
                    ListOfWallet[0].address,
                    ListOfWallet[0].private_key,
                );
                accountGame = await starknet.OpenZeppelinAccount.getAccountFromAddress(
                    ListOfWallet[1].address,
                    ListOfWallet[1].private_key,
                );
                accountAdmin = await starknet.OpenZeppelinAccount.getAccountFromAddress(
                    ListOfWallet[2].address,
                    ListOfWallet[2].private_key,
                );
                // create children account
                contractChildrenFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
                const classHashD = await accountParent.declare(contractChildrenFactory);
                console.log("classHashD =", classHashD);
                const signerD = generateKeys(ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"));
                const pubKeyD = signerD.publicKey;
                const privKeyD = signerD.privateKey;
                const constructorAccountD = [
                    BigInt(accountParent.address).toString(), // super administrator
                    BigInt(pubKeyD).toString()
                ];
                childrenAccount = await MyAccountChildren.createAccount(constructorAccountD, { classH: classHashD, privateKey: privKeyD });
                // fund the account before deploying it
                const { data: answerD } = await axios.post('http://127.0.0.1:5050/mint', { "address": childrenAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
                //console.log('Answer mint =', answerD);
                const deploymentTxHashD = await childrenAccount.deployAccount({ maxFee: 9000000000000000 });
                break;
            case "alpha"://testnet alpha goerli ETH

                accountParent = await starknet.ArgentAccount.getAccountFromAddress(
                    addrArgentXWallet4_A1,
                    ensureEnvVar("ARGENTX_AC4_TESNET1_PRIVATE_KEY"),
                );
                accountGame = await starknet.ArgentAccount.getAccountFromAddress(
                    addrArgentXWallet5_A1,
                    ensureEnvVar("ARGENTX_AC5_TESNET1_PRIVATE_KEY"),
                );
                accountAdmin = await starknet.ArgentAccount.getAccountFromAddress(
                    addrArgentXWallet6_A1,
                    ensureEnvVar("ARGENTX_AC6_TESNET1_PRIVATE_KEY"),
                );

                // create children account
                contractChildrenFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
                const classHashA1 = await accountParent.declare(contractChildrenFactory);
                const signerA1 = generateKeys(ensureEnvVar("OZ_CHILDREN_ACCOUNT_PRIVATE_KEY"));
                const pubKeyA1 = signerA1.publicKey;
                const privKeyA1 = signerA1.privateKey;
                const constructorAccountA1 = [
                    BigInt(accountParent.address).toString(), // super administrator
                    BigInt(pubKeyA1).toString()
                ];
                childrenAccount = await MyAccountChildren.createAccount(constructorAccountA1, { classH: classHashA1, privateKey: privKeyA1 });
                // Fund the account before deploying it.
                // Estimate fee with Starknet.js (not possible in Hardhat Starknet plugin).
                console.log("Fund future Children Account ...");
                // const providerA1 = new Provider({ sequencer: { network: 'goerli-alpha' } }); // for testnet 1
                // const privateKeyA1 = ensureEnvVar("OZ_ARGENTX_ACC1DEVNET_PRIVATE_KEY"); //parent account
                // const starkKeyPairA1 = ec.getKeyPair(privateKeyA1);
                // const accountAddressA1 = addrArgentXWallet;
                // const accountA1: Account = new Account(providerA1, accountAddressA1, starkKeyPairA1);
                // const { suggestedMaxFee: estimatedFeeA1 } = await accountA1.estimateAccountDeployFee({
                //     classHash: classHashA1,
                //     constructorCalldata: constructorAccountA1,
                //     contractAddress: childrenAccount.address
                // });
                // console.log("Estimated fee for account deployement =", estimatedFeeA1);
                // throw new Error("validate this fee!");
                // const feeAllowed = BigInt(stark.estimatedFeeToMaxFee(estimatedFeeA1, 0.1).toString()) + 500_000_000_000_000n; // added for future account usage
                // const deploymentTxHashA1 = await childrenAccount.deployAccount({ maxFee: feeAllowed });
                break;
            case "alpha-goerli-2"://testnet alpha 2 goerli ETH
                //     
                break;
            default:
                throw new Error("Only Devnet & Tesnet 1 authorized for this script!")
        }
        console.log("childrenAccount.address =", childrenAccount.address);
        console.log("Initialization ended.")

        //const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");
        childrenContract = contractChildrenFactory.getContractAt(childrenAccount.address);
    })

    it("Should succeed: Super admin is parent.", async function () {
        const { super_admin_addr: result } = await childrenContract.call("getSuperAdmin");
        console.log("getSuperAdmin =", result);
        expect(BigInt(String(result))).to.be.equal(BigInt(accountParent.address));
    })

    it("should fail: Game Account can't self promote as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "addAdmin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("should fail: Game Account can't promote accountAdmin as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "addAdmin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("Should succeed: Super admin promote accountAdmin as admin.", async function () {
        await accountParent.invoke(childrenContract, "addAdmin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("isAdmin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(true));
    })

    it("should fail: AccountGame (is not admin) can't self revoke as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "removeSelfAdmin", {}, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_remove_self_admin:_caller_is_not_admin");
        }
    })

    it("should fail: AccountGame (is admin) can't revoke other admin.", async function () {
        try {
            await accountParent.invoke(childrenContract, "addAdmin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            await accountGame.invoke(childrenContract, "removeAdmin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            await accountParent.invoke(childrenContract, "removeAdmin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("Should succeed: AccountAdmin can self revoke.", async function () {
        const { is_admin: beforeTest } = await childrenContract.call("isAdmin", { user_address: accountAdmin.address });
        expect(BigInt(String(beforeTest))).to.be.equal(BigInt(true));
        await accountAdmin.invoke(childrenContract, "removeSelfAdmin", {}, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("isAdmin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(false));
    })

    it("Should succeed: Super Admin can revoke admin.", async function () {
        await accountParent.invoke(childrenContract, "addAdmin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        await accountParent.invoke(childrenContract, "removeAdmin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("isAdmin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(false));
    })

    it("should fail: Super Admin can't promote as administrator the 0 address.", async function () {
        try {
            await accountParent.invoke(childrenContract, "addAdmin", { address: 0 }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_add_admin:_new_admin_is_the_zero_address");
        }
    })

    it("Should succeed: right list of admins.", async function () {
        const { array: listAdmin } = await childrenContract.call("getListAdmin", {});
        //console.log("list of admin =", listAdmin, typeof (listAdmin));
        //console.log("BigInt(accountParent.address) =", BigInt(accountParent.address));
        expect(listAdmin).to.deep.equal([BigInt(accountParent.address)]);
    })


});

