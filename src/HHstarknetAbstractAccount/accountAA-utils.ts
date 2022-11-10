import { StarknetContract, StringMap } from "@shardlabs/starknet-hardhat-plugin/dist/src//types";
//import { toBN } from "starknet/utils/number";
//import * as ellipticCurve from "starknet/utils/ellipticCurve";
import { ec } from "elliptic";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import path from "path";
import { ABI_SUFFIX, ACCOUNT_ARTIFACTS_DIR } from "@shardlabs/starknet-hardhat-plugin/dist/src//constants";
import { ACCOUNTAA_CONTRACTS_DIR } from "./constantsAA";
import { StarknetPluginError } from "@shardlabs/starknet-hardhat-plugin/dist/src/starknet-plugin-error";
//import { flattenStringMap } from "./utils";

// export type CallParameters = {
//     toContract: StarknetContract;
//     functionName: string;
//     calldata?: StringMap;
// };

// type KeysType = {
//     publicKey: string;
//     privateKey: string;
//     keyPair: ec.KeyPair;
// };

export async function handleAccountAAContractArtifacts(
    accountType: string,
    artifactsName: string,
    artifactsVersion: string,
    hre: HardhatRuntimeEnvironment
): Promise<string> {
    // Name of the source contract  
    const contractBase = artifactsName + ".cairo";
    // Path of AA source code
    const starknetSourcesPath = hre.config.paths.starknetSources ?? path.join(__dirname, "..", "..", "contracts");
    const contractSourcePath = path.join(
        starknetSourcesPath,
        ACCOUNTAA_CONTRACTS_DIR,
        accountType,
        artifactsVersion
    );
    const contractSourceFile = path.join(contractSourcePath, contractBase);

    // path to where the artifacts will be saved
    const RelativePathSource = path.relative(hre.config.paths.root, starknetSourcesPath);
    const artifactsTargetPath = path.join(
        hre.config.paths.starknetArtifacts,
        RelativePathSource,
        ACCOUNTAA_CONTRACTS_DIR,
        accountType,
        artifactsVersion
    );
    // names of files after compilation
    const jsonArtifact = artifactsName + ".json";
    const abiArtifact = artifactsName + ABI_SUFFIX;

    // check source file exists
    fs.access(contractSourceFile, (err) => { new StarknetPluginError("Abstract Account source not at the expected location :" + contractSourceFile) });
    // flush result dir
    fs.rmSync(artifactsTargetPath, { force: true, recursive: true })
    // compile
    await hre.run("starknet-compile", { paths: [contractSourceFile], disableHintValidation: true, accountContract: true });
    // check compiled file exists
    if (!fs.existsSync(path.join(artifactsTargetPath, contractBase, jsonArtifact))) {
        throw new StarknetPluginError("Compiled contract not at the expected location :" + artifactsTargetPath);
    }

    return path.join(artifactsTargetPath, contractBase);
}

// /**
//  * Checks if the provided artifact exists in the project's artifacts folder.
//  * If it doesn't exist, it is downloaded from the GitHub repository.
//  * @param fileName artifact file to download. E.g. "Account.json" or "Account_abi.json"
//  * @param artifactsTargetPath folder to where the artifacts will be downloaded. E.g. "project/starknet-artifacts/Account.cairo"
//  * @param artifactSourcePath path to the folder where the artifacts are stored
//  */
// async function ensureArtifact(
//     fileName: string,
//     artifactsTargetPath: string,
//     artifactSourcePath: string
// ) {
//     const finalTargetPath = path.join(artifactsTargetPath, fileName);
//     if (!fs.existsSync(finalTargetPath)) {
//         fs.mkdirSync(artifactsTargetPath, { recursive: true });

//         const finalSourcePath = path.join(artifactSourcePath, fileName);
//         fs.copyFileSync(finalSourcePath, finalTargetPath);
//     }
//}
