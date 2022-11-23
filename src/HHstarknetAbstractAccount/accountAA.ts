

import path from "path";
import { Account } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { DeployAccountOptions, StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { HardhatRuntimeEnvironment, StringMap } from "hardhat/types";
import { TransactionHashPrefix, TRANSACTION_VERSION } from "@shardlabs/starknet-hardhat-plugin/dist/src/constants";
import { Call, hash, RawCalldata } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { BigNumberish, toBN } from "starknet/utils/number";
import { generateKeys, handleAccountContractArtifacts, signMultiCall } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import * as ellipticCurve from "starknet/utils/ellipticCurve";
import { StarknetPluginError } from "@shardlabs/starknet-hardhat-plugin/dist/src/starknet-plugin-error";
import { handleAccountAAContractArtifacts } from "./accountAA-utils";
import { ACCOUNTAA_CONTRACTS_DIR } from "./constantsAA";


export { Account };
/**
 * Wrapper for your Account abstraction implementation 
 */
export class OZaccountAA extends Account {
    static readonly ACCOUNT_ARTIFACTS_NAME = "myAccountAbstraction";
    static readonly VERSION = "v1_0_0";

    constructor(
        starknetContract: StarknetContract,
        privateKey: string,
        hre: HardhatRuntimeEnvironment
    ) {
        super(starknetContract, privateKey, hre);
    }

    protected getMessageHash(
        transactionHashPrefix: TransactionHashPrefix,
        accountAddress: string,
        callArray: Call[],
        nonce: string,
        maxFee: string,
        version: string
    ): string {
        const hashable: Array<BigNumberish> = [callArray.length];
        const rawCalldata: RawCalldata = [];
        callArray.forEach((call) => {
            let cdata: RawCalldata = [];
            if (call.calldata) { cdata = call.calldata };
            hashable.push(
                call.contractAddress,
                hash.starknetKeccak(call.entrypoint),
                rawCalldata.length,
                cdata.length
            );
            rawCalldata.push(...cdata);
        });

        let chainId: StarknetChainId = StarknetChainId.TESTNET;
        if (this.hre.config.starknet.networkConfig) {
            chainId = this.hre.config.starknet.networkConfig.starknetChainId ?? StarknetChainId.TESTNET;
        }


        hashable.push(rawCalldata.length, ...rawCalldata);
        const calldataHash = hash.computeHashOnElements(hashable);
        return hash.computeHashOnElements([
            transactionHashPrefix,
            version,
            accountAddress,
            0, // entrypoint selector is implied
            calldataHash,
            maxFee,
            chainId,
            nonce
        ]);
    }

    protected getSignatures(messageHash: string): bigint[] {
        return signMultiCall(this.publicKey, this.keyPair, messageHash);
    }
    // ***********
    static async deployAAfromABI(
        hre: HardhatRuntimeEnvironment,
        AAtype: string,
        constructorAA: StringMap,
        options: DeployAccountOptions = {}
    ): Promise<OZaccountAA> {
        // 
        const contractPath = await handleAccountAAContractArtifacts(
            AAtype,
            OZaccountAA.ACCOUNT_ARTIFACTS_NAME,
            OZaccountAA.VERSION,
            hre
        ); // Compile and Check origin path of files

        const signer = generateKeys(options.privateKey);

        const contractFactory = await hre.starknet.getContractFactory(contractPath);
        const constructor: StringMap = { ...constructorAA, publicKey: BigInt(signer.publicKey) };
        const contract = await contractFactory.deploy(
            constructor,
            options
        );

        return new OZaccountAA(contract, signer.privateKey, hre);
    }
    // *******************
    static async getAccountAAfromAddress(
        address: string,
        privateKey: string,
        AAtype: string,
        hre: HardhatRuntimeEnvironment
    ): Promise<OZaccountAA> {
        const starknetSourcesPath = hre.config.paths.starknetSources ?? path.join(__dirname, "..", "..", "contracts");
        const RelativePathSource = path.relative(hre.config.paths.root, starknetSourcesPath);
        const contractBase = OZaccountAA.ACCOUNT_ARTIFACTS_NAME + ".cairo";
        const contractPath = path.join(
            hre.config.paths.starknetArtifacts,
            RelativePathSource,
            ACCOUNTAA_CONTRACTS_DIR,
            AAtype,
            OZaccountAA.VERSION,
            contractBase
        );

        const contractFactory = await hre.starknet.getContractFactory(contractPath);
        const contract = contractFactory.getContractAt(address);

        const { publicKey: expectedPubKey } = await contract.call("getPublicKey");

        const keyPair = ellipticCurve.getKeyPair(toBN(privateKey.substring(2), "hex"));
        const publicKey = ellipticCurve.getStarkKey(keyPair);

        if (BigInt(publicKey) !== expectedPubKey) {
            throw new StarknetPluginError(
                "The provided private key is not compatible with the public key stored in the contract."
            );
        }

        return new OZaccountAA(contract, privateKey, hre);
    }

    protected hasRawOutput(): boolean {
        return false;
    }
}