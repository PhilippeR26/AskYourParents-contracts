import "hardhat/types/runtime";
import { Account, ArgentAccount, OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { OZaccountA } from "./accountA";


type WalletUserConfig = {
    [walletName: string]: WalletConfig | undefined;
};

type WalletConfig = {
    modulePath: string;
    accountName?: string;
    accountPath?: string;
};
type OpenZeppelinAccountType = OpenZeppelinAccount;

declare module "hardhat/types/config" {

}