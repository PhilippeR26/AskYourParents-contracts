import "@shardlabs/starknet-hardhat-plugin/dist/src/type-extensions";

import exitHook from "exit-hook";
import { ExternalServer } from "@shardlabs/starknet-hardhat-plugin/dist/src/external-server";
import { task, extendEnvironment, extendConfig } from "hardhat/config";
import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from "hardhat/types";


exitHook(() => {
    ExternalServer.cleanAll();
});

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    if (userConfig.starknet) {
        config.starknet = JSON.parse(JSON.stringify(userConfig.starknet));
    }
    if (!config.starknet) {
        config.starknet = {};
    }
});

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
    hre.starknet = {
        getContractFactory: async (contractPath) => {
            const contractFactory = await getContractFactoryUtil(hre, contractPath);
            return contractFactory;
        },

        shortStringToBigInt: (convertableString) => {
            const convertedString = shortStringToBigIntUtil(convertableString);
            return convertedString;
        },

        bigIntToShortString: (convertableBigInt) => {
            const convertedBigInt = bigIntToShortStringUtil(convertableBigInt);
            return convertedBigInt;
        },

        getWallet: (name) => {
            const wallet = getWalletUtil(name, hre);
            return wallet;
        },

        devnet: lazyObject(() => new DevnetUtils(hre)),

        deployAccount: async (accountType, options) => {
            const account = await deployAccountUtil(accountType, hre, options);
            return account;
        },

        getAccountFromAddress: async (address, privateKey, accountType) => {
            const account = await getAccountFromAddressUtil(address, privateKey, accountType, hre);
            return account;
        },

        getTransaction: async (txHash) => {
            const transaction = await getTransactionUtil(txHash, hre);
            return transaction;
        },

        getTransactionReceipt: async (txHash) => {
            const txReceipt = await getTransactionReceiptUtil(txHash, hre);
            return txReceipt;
        },

        getBlock: async (identifier) => {
            const block = await getBlockUtil(hre, identifier);
            return block;
        },

        getNonce: async (address, options) => {
            const nonce = await getNonceUtil(hre, address, options);
            return nonce;
        }
    };
});
