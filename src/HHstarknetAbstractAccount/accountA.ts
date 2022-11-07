

import { Account } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TransactionHashPrefix, TRANSACTION_VERSION } from "@shardlabs/starknet-hardhat-plugin/dist/src/constants";
import { Call, hash, RawCalldata } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { BigNumberish, toBN } from "starknet/utils/number";


/**
 * Wrapper for the OpenZeppelin implementation of an Account
 */
export class OZaccountA extends Account {
    static readonly ACCOUNT_TYPE_NAME = "OZAccountAbstract";
    static readonly ACCOUNT_ARTIFACTS_NAME = "Account";
    static readonly VERSION = "1_0_0";

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

    static async deployFromABI(
        hre: HardhatRuntimeEnvironment,
        options: DeployAccountOptions = {}
    ): Promise<OpenZeppelinAccount> {
        const contractPath = await handleAccountContractArtifacts(
            OpenZeppelinAccount.ACCOUNT_TYPE_NAME,
            OpenZeppelinAccount.ACCOUNT_ARTIFACTS_NAME,
            OpenZeppelinAccount.VERSION,
            hre
        );

        const signer = generateKeys(options.privateKey);

        const contractFactory = await hre.starknet.getContractFactory(contractPath);
        const contract = await contractFactory.deploy(
            { publicKey: BigInt(signer.publicKey) },
            options
        );

        return new OpenZeppelinAccount(contract, signer.privateKey, hre);
    }

    static async getAccountFromAddress(
        address: string,
        privateKey: string,
        hre: HardhatRuntimeEnvironment
    ): Promise<OpenZeppelinAccount> {
        const contractPath = await handleAccountContractArtifacts(
            OpenZeppelinAccount.ACCOUNT_TYPE_NAME,
            OpenZeppelinAccount.ACCOUNT_ARTIFACTS_NAME,
            OpenZeppelinAccount.VERSION,
            hre
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

        return new OpenZeppelinAccount(contract, privateKey, hre);
    }

    protected hasRawOutput(): boolean {
        return false;
    }
}