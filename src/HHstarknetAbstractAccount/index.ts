import "@shardlabs/starknet-hardhat-plugin/dist/src/type-extensions";

import exitHook from "exit-hook";
import { ExternalServer } from "@shardlabs/starknet-hardhat-plugin/dist/src/external-server";
import { task, extendEnvironment, extendConfig } from "hardhat/config";
//import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from "hardhat/types";
import { StarknetContractFactory } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import "./type-AAextensions";
import {
    deployAccountAAUtil,
    getAccountAAFromAddressUtil,
    getWalletAAUtil,
} from "./extendAA-utils";


// extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
//     if (userConfig.starknet) {
//         config.starknet = JSON.parse(JSON.stringify(userConfig.starknet));
//     }
//     if (!config.starknet) {
//         config.starknet = {};
//     }
// });

extendEnvironment((hre) => {
    hre.AAccount = {
        sayHello: () => { return "hello" },


        // getWalletAA: (name) => {
        //     const wallet = getWalletUtil(name, hre);
        //     return wallet;
        // },

        deployAccountAA: async (accountType, constructorAA, options) => {
            const account = await deployAccountAAUtil(accountType, constructorAA, hre, options);
            return account;
        },

        getAccountAAfromAddress: async (address, privateKey, accountType) => {
            const account = await getAccountAAFromAddressUtil(address, privateKey, accountType, hre);
            return account;
        },
    }
}
);
