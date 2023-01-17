import { Account } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { calculateDeployAccountHash, generateKeys, sendDeployAccountTx, signMultiCall } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import { TransactionHashPrefix, StarknetChainId } from "@shardlabs/starknet-hardhat-plugin/dist/src/constants";
import { DeployAccountOptions, StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { generateRandomSalt, numericToHexString } from "@shardlabs/starknet-hardhat-plugin/dist/src/utils";
import { ec } from "elliptic";
import * as ellipticCurve from "starknet/utils/ellipticCurve";

import { Call, hash, RawCalldata, number } from "starknet";


export class MyAccountChildren extends Account {
    // alternatively replace the constructor with a static initialize method if you need async code

    static readonly MYACCOUNTPATH = "starknet-artifacts/contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo";

    public readonly salt: string;
    public classHash: string = "";
    public readonly constructorCalldata: string[];
    //private readonly contractFactory: StarknetContractFactory;
    public readonly addressAccount: string;

    protected constructor(
        starknetContract: StarknetContract,
        privateKey: string,
        constructorCalldata: string[],
        salt: string,
        deployed: boolean,
        addressAccount: string
    ) {
        super(starknetContract, privateKey, salt, deployed);
        this.salt = salt;
        this.constructorCalldata = constructorCalldata;
        this.addressAccount = addressAccount;
        this.deployed = deployed;
    }

    public static standardGetMessageHash(
        transactionHashPrefix: TransactionHashPrefix,
        accountAddress: string,
        callArray: Call[],
        nonce: string,
        maxFee: string,
        version: string,
        chainId: StarknetChainId
    ): string {
        const hashable: Array<number.BigNumberish> = [callArray.length];
        const rawCalldata: RawCalldata = [];
        callArray.forEach((call) => {
            hashable.push(
                call.contractAddress,
                hash.starknetKeccak(call.entrypoint),
                rawCalldata.length,
                call.calldata!.length
            );
            rawCalldata.push(...call.calldata!);
        });

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

    public static standardGetSignatures(
        publicKey: string,
        keyPair: ec.KeyPair,
        messageHash: string): bigint[] {
        return signMultiCall(publicKey, keyPair, messageHash);
    }

    public static async createAccount(
        constructorCalldata: string[],
        options: {
            classH?: string;
            salt?: string;
            privateKey?: string;
        } = {}
    ): Promise<MyAccountChildren> {
        const hre = await import("hardhat");
        const signer = generateKeys(options.privateKey);
        const salt = options.salt || generateRandomSalt();
        const contractFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
        const classHash = options.classH || await contractFactory.getClassHash();

        const address = hash.calculateContractAddressFromHash(
            salt,
            classHash,
            constructorCalldata,
            "0x0" // deployer address
        );
        const contract = contractFactory.getContractAt(address);
        return new this(contract, signer.privateKey, constructorCalldata, salt, false, address);
    }

    protected getMessageHash(
        transactionHashPrefix: TransactionHashPrefix,
        accountAddress: string,
        callArray: Call[],
        nonce: string,
        maxFee: string,
        version: string,
        chainId: StarknetChainId
    ): string {
        //       If necessary, replace by your own message Hash mechanism :
        return MyAccountChildren.standardGetMessageHash(
            transactionHashPrefix,
            accountAddress,
            callArray,
            nonce,
            maxFee,
            version,
            chainId
        );
    }

    protected getSignatures(messageHash: string): bigint[] {
        //       If necessary, replace by your own signature mechanism :
        return MyAccountChildren.standardGetSignatures(this.publicKey, this.keyPair, messageHash);
    }

    async deployAccount(options: DeployAccountOptions = {}): Promise<string> {
        //throw new Error("Method not implemented.");
        this.assertNotDeployed();
        const hre = await import("hardhat");
        const maxFee = numericToHexString(options.maxFee || 0);
        if (this.classHash === "") {
            const contractFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
            this.classHash = await contractFactory.getClassHash()
        }
        const classHash = this.classHash;
        //const constructorCalldata = [BigInt(this.publicKey).toString()];
        console.log("hre.starknet.networkConfig.starknetChainId =", hre.starknet.networkConfig.starknetChainId);

        const msgHash = calculateDeployAccountHash(
            this.addressAccount,
            this.constructorCalldata,
            this.salt,
            classHash,
            maxFee,
            hre.starknet.networkConfig.starknetChainId ?? StarknetChainId.TESTNET
        );
        console.log("lancement commande deploy...");

        const deploymentTxHash = await sendDeployAccountTx(
            this.getSignatures(msgHash).map((val) => val.toString()),
            classHash,
            this.constructorCalldata,
            this.salt,
            maxFee
        );

        this.starknetContract.deployTxHash = deploymentTxHash;
        this.deployed = true;
        return deploymentTxHash;
    }

    static async getAccountFromAddress(
        address: string,
        privateKey: string
    ): Promise<MyAccountChildren> {
        const hre = await import("hardhat");
        const contractFactory = await hre.starknet.getContractFactory(MyAccountChildren.MYACCOUNTPATH);
        const contract = contractFactory.getContractAt(address);

        const { publicKey: expectedPubKey } = await contract.call("getPublicKey");
        const keyPair = ellipticCurve.getKeyPair(number.toBN(privateKey.substring(2), "hex"));
        const publicKey = ellipticCurve.getStarkKey(keyPair);

        if (BigInt(publicKey) !== expectedPubKey) {
            throw new Error(
                "The provided private key is not compatible with the public key stored in the contract."
            );
        }

        return new this(contract, privateKey, [], "0", true, address);
    }
}