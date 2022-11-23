// DO NOT WORK
// Test ChildrenAccount-management of admnistrators.
// 100 ECU are minted to the parent wallet.
import { Uint256, bnToUint256 } from "starknet/dist/utils/uint256";
import { starknet } from "hardhat";
import type { Account, StarknetContract, StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import { adaptAddress, ensureEnvVar } from "../src/util";
import LogC from "../src/logColors";
import { addrDeployerAlpha, addrDeployerAlpha2, addrDeployerDevnet, addrParentAlpha, addrParentAlpha2 } from "../src/const";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });
import * as mocha from "mocha";
import { expect } from "chai";

mocha.describe("Starknet", function () {
    this.timeout(900000);

    it("should work for a fresh deployment", async function () {
        // to perform before launching script :
        // source .env     for initialization of vars
        const whichNetwork = hre.config.starknet.network;
        console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
        //process.exit(0);
        expect(whichNetwork).to.be.equal("devnet");
    });
});
