import { expect } from "chai";
import hre, { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory, Account } from "hardhat/types/runtime";
import { addrAdminAlpha, addrAdminAlpha2, addrChildrenAlpha, addrChildrenAlpha2, addrChildrenDevnet, addrGameAlpha, addrGameAlpha2, addrParentAlpha, addrParentAlpha2, TIMEOUT } from "../src/const";
import { ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import { AAccount } from "hardhat";
import * as dotenv from 'dotenv';
import { OZaccountAA } from "../src/HHstarknetAbstractAccount/accountAA";
dotenv.config({ path: "../.env" });

describe("Test of Children Account-administrators :", function () {
    this.timeout(TIMEOUT);
    let accountParent: Account;
    let accountGame: Account;
    let childrenAccount: OZaccountAA;
    let childrenContract: StarknetContract;
    let accountAdmin: Account;
    before(async function () {
        dotenv.config({ path: "../.env" });
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
                accountAdmin = await starknet.getAccountFromAddress(
                    ListOfWallet[2].address,
                    ListOfWallet[2].private_key,
                    "OpenZeppelin"
                );
                //console.log("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY=", ensureEnvVar("OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY"));
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
                accountAdmin = await starknet.getAccountFromAddress(
                    addrAdminAlpha,
                    ensureEnvVar("OZ_ADMIN_ACCOUNT_PRIVATE_KEY"),
                    "OpenZeppelin"
                );

                childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha, ensureEnvVar("OZ_CHILDREN_ACCOUNT_PRIVATE_KEY"), "ChildrenAA");
                break;
            case "alpha-goerli-2"://testnet alpha 2 goerli ETH
                accountParent = await starknet.getAccountFromAddress(
                    addrParentAlpha2,
                    ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY"),
                    "OpenZeppelin"
                );
                accountGame = await starknet.getAccountFromAddress(
                    addrGameAlpha2,
                    ensureEnvVar("OZ_GAME_ACCOUNT2_PRIVATE_KEY"),
                    "OpenZeppelin"
                );
                accountAdmin = await starknet.getAccountFromAddress(
                    addrAdminAlpha2,
                    ensureEnvVar("OZ_ADMIN_ACCOUNT2_PRIVATE_KEY"),
                    "OpenZeppelin"
                );
                childrenAccount = await AAccount.getAccountAAfromAddress(addrChildrenAlpha2, ensureEnvVar("OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY"), "ChildrenAA");
                break;
            default:
                throw new Error("IntegratedDevnet not authorized for this script!")
        }
        const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");
        childrenContract = ChildrenAAFactory.getContractAt(childrenAccount.address);
    })

    it("Should succeed: Super admin is parent.", async function () {
        const { super_admin_addr: result } = await childrenContract.call("get_super_admin");
        expect(BigInt(String(result))).to.be.equal(BigInt(accountParent.address));
    })

    it("should fail: Game Account can't self promote as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "add_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("should fail: Game Account can't promote accountAdmin as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "add_admin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("Should succeed: Super admin promote accountAdmin as admin.", async function () {
        await accountParent.invoke(childrenContract, "add_admin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(true));
    })

    it("should fail: AccountGame (is not admin) can't self revoke as admin.", async function () {
        try {
            await accountGame.invoke(childrenContract, "remove_self_admin", {}, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_remove_self_admin:_caller_is_not_admin");
        }
    })

    it("should fail: AccountGame (is admin) can't revoke other admin.", async function () {
        try {
            await accountParent.invoke(childrenContract, "add_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            await accountGame.invoke(childrenContract, "remove_admin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            await accountParent.invoke(childrenContract, "remove_admin", { address: accountGame.address }, { maxFee: 900_000_000_000_000 });
            //console.error(err.message);
            expect(err.message).to.contain("error_assert_only_super_admin:caller_is_not_super_administrator");
        }
    })

    it("Should succeed: AccountAdmin can self revoke.", async function () {
        const { is_admin: beforeTest } = await childrenContract.call("is_admin", { user_address: accountAdmin.address });
        expect(BigInt(String(beforeTest))).to.be.equal(BigInt(true));
        await accountAdmin.invoke(childrenContract, "remove_self_admin", {}, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(false));
    })

    it("Should succeed: Super Admin can revoke admin.", async function () {
        await accountParent.invoke(childrenContract, "add_admin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        await accountParent.invoke(childrenContract, "remove_admin", { address: accountAdmin.address }, { maxFee: 900_000_000_000_000 });
        const { is_admin: result } = await childrenContract.call("is_admin", { user_address: accountAdmin.address });
        expect(BigInt(String(result))).to.be.equal(BigInt(false));
    })

    it("should fail: Super Admin can't promote as administrator the 0 address.", async function () {
        try {
            await accountParent.invoke(childrenContract, "add_admin", { address: 0 }, { maxFee: 900_000_000_000_000 });
            expect.fail("Has not failed, but should have!");
        } catch (err: any) {
            //console.error(err.message);
            expect(err.message).to.contain("error_set_admin:_new_admin_is_the_zero_address");
        }
    })

});

