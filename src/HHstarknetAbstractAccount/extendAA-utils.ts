// functions to execute the Account Abstraction
import { OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { StarknetPluginError } from "@shardlabs/starknet-hardhat-plugin/dist/src/starknet-plugin-error";
import { AccountImplementationType, DeployAccountOptions } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { Block, HardhatRuntimeEnvironment, StringMap } from "hardhat/types";
import { Account, OZaccountAA } from "./accountAA";



export function getWalletAAUtil(name: string, hre: HardhatRuntimeEnvironment) {
    // const wallet = hre.config.starknet.wallets[name];
    // if (!wallet) {
    //     const available = Object.keys(hre.config.starknet.wallets).join(", ");
    //     const msg = `Invalid wallet name provided: ${name}.\nValid wallets: ${available}`;
    //     throw new StarknetPluginError(msg);
    // }
    // wallet.accountPath = getAccountPath(wallet.accountPath, hre);
    // return wallet;
}

export async function deployAccountAAUtil(
    accountType: string,
    constructorAA: StringMap,
    hre: HardhatRuntimeEnvironment,
    options?: DeployAccountOptions
): Promise<Account> {
    //let account: Account;
    const account = await OZaccountAA.deployAAfromABI(hre, accountType, constructorAA, options);
    //           throw new StarknetPluginError("Invalid account type requested.");

    return account;
}

export async function getAccountAAFromAddressUtil(
    address: string,
    privateKey: string,
    accountType: string,
    hre: HardhatRuntimeEnvironment
): Promise<Account> {
    let account: Account;
    account = await OZaccountAA.getAccountAAfromAddress(address, privateKey, accountType, hre);

    return account;
}