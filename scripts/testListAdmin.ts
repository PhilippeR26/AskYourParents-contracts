// 
// premier essai de la liste d'administeurs
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { starknet } from "hardhat";
import type { Account, StarknetContract, StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import { adaptAddress, ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset, "\nTest of administrator list in progress...");
    if (whichNetwork != "devnet") { throw new Error("Only in devnet!") }
    const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    // Define Parent Wallet.
    const accountParent: Account = await starknet.OpenZeppelinAccount.getAccountFromAddress(ListOfWallet[0].address, ListOfWallet[0].private_key);


    const contractFactoryAdmin = await starknet.getContractFactory("contracts/listAdmin.cairo");
    const classHashAdmin = await accountParent.declare(contractFactoryAdmin, { maxFee: 900_000_000_000_000 });// as Fee of Declare function can't be estimated, let's jump in with a rough and over-evaluated value....
    console.log("✅ Admin contract class hash contract :", classHashAdmin);

    const constructorAdmin: StringMap = {};

    const contractAdmin = await accountParent.deploy(contractFactoryAdmin, constructorAdmin, { maxFee: 9_000_000_000_000_000 });
    // const contractECU = await accountParent.deploy(contractFactoryAdmin, constructorAdmin, { maxFee: 9_000_000_000_000_000, salt: "0x00" });

    const AdmindeploymentAddress = contractAdmin.address;
    console.log("✅ Admin instance deployed to:", AdmindeploymentAddress);

    await accountParent.invoke(contractAdmin, "add_admin", { admin_address: 10 });
    console.log("added admin addr 10.")
    await accountParent.invoke(contractAdmin, "add_admin", { admin_address: 11 });
    console.log("added admin addr 11.")
    await accountParent.invoke(contractAdmin, "add_admin", { admin_address: 12 });
    console.log("added admin addr 12.")
    await accountParent.invoke(contractAdmin, "add_admin", { admin_address: 13 });
    console.log("added admin addr 13.")
    const { nb_admin: nbAdmin } = await contractAdmin.call("get_nb_admin", {});
    console.log("nb_admin =", nbAdmin.toString());
    const { admin_array: listAdmin } = await contractAdmin.call("get_list_admin", {});
    console.log("listAdmin =", listAdmin);
    await accountParent.invoke(contractAdmin, "remove_admin_id", { admin_id: 2 });
    console.log("remove admin id 4.")
    const { nb_admin: nbAdmin2 } = await contractAdmin.call("get_nb_admin", {});
    console.log("nb_admin2 =", nbAdmin2.toString());
    const { admin_array: listAdmin2 } = await contractAdmin.call("get_list_admin", {});
    console.log("listAdmin2 =", listAdmin2);


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });
