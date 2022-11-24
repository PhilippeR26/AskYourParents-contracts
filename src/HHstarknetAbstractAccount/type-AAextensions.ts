import "hardhat/types/runtime";
import { Account, ArgentAccount, OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { OZaccountAA } from "./accountAA";
import { StarknetWrapper } from "@shardlabs/starknet-hardhat-plugin/dist/src/starknet-wrappers";
import { DeployAccountOptions } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";


type WalletUserConfig = {
    [walletName: string]: WalletConfig | undefined;
};

type WalletConfig = {
    modulePath: string;
    accountName?: string;
    accountPath?: string;
};
type OpenZeppelinAccountType = OpenZeppelinAccount;

//export abstract class ExampleHardhatRuntimeEnvironmentField {
//    public abstract sayHello(): string
//}
declare module "hardhat/types/runtime" {
    //     export interface HardhatRuntimeEnvironment {
    //         example: ExampleHardhatRuntimeEnvironmentField;
    //     }
    interface HardhatRuntimeEnvironment {
        starknetWrapper: StarknetWrapper;

        AAccount: {
            sayHello: () => string;

            /**
             * Get an Account Abstraction Wallet defined in the hardhat.config.ts file.
             * @param name the name of the wallet to get
             * @returns a wallet
             */
            //getWalletAA: (name: string) => WalletConfig;

            /**
             * Deploys an Account Abstraction contract based on the ABI and the type of Account selected
             * @param accountType the string name of Account type to use
             * @param constructorAA constructor parameters <StringMap>, without PublicKey parameter
             * @param options optional deployment options
             * @returns an Account object
             */
            deployAccountAA: (accountType: string, constructorAA: StringMap, options?: DeployAccountOptions) => Promise<OZaccountAA>;

            /**
             * Returns an Abstract Account already deployed based on the address and validated by the private key
             * @param address the address where the account is deployed
             * @param privateKey the private key of the account
             * @param accountType the enumerator value of the type of Account to use
             * @returns an Account object
             */
            getAccountAAfromAddress: (address: string, privateKey: string, accountType: string) => Promise<OZaccountAA>;
        }

    }
}