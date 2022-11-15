// Read the ETH balance of the parent account.
// 
import { uint256ToBN } from "starknet/dist/utils/uint256";
import { toHex, hexToDecimalString } from "starknet/dist/utils/number";
import { starknet } from "hardhat";
import type { StringMap } from "hardhat/types/runtime";
import hre from "hardhat";
import LogC from "../src/logColors";
import { addrECUdevnet, addrETHalpha, addrETHalpha2, addrETHdevnet, addrGameAlpha2, addrParentAlpha, addrParentAlpha2 } from "../src/const";
import { adaptAddress, ensureEnvVar } from "../src/util";
import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);

    let addrETH: string;
    let addrWallet: string;
    let privKey: string;
    switch (whichNetwork) {
        case "devnet":
            addrETH = addrETHdevnet;
            const ListOfWalletDevnet = await starknet.devnet.getPredeployedAccounts();
            addrWallet = ListOfWalletDevnet[0].address;
            privKey = ListOfWalletDevnet[0].private_key;
            break;
        case "alpha":
            addrETH = addrETHalpha;
            addrWallet = addrParentAlpha;
            privKey = ensureEnvVar("OZ_PARENT_ACCOUNT_PRIVATE_KEY")
            break;
        case "alpha-goerli-2":
            addrETH = addrETHalpha2;
            addrWallet = addrParentAlpha2;
            privKey = ensureEnvVar("OZ_PARENT_ACCOUNT2_PRIVATE_KEY")
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    const accountR = await starknet.getAccountFromAddress(
        addrWallet,
        privKey,
        "OpenZeppelin"
    );

    const ERC20source = await starknet.getContractFactory("starknet-artifacts/contracts/openzeppelin/token/erc20/presets/ERC20.cairo");
    const ERC20contract = ERC20source.getContractAt(addrETH);

    const payloadCall: StringMap = { account: BigInt(addrWallet) };
    const { balance: balanceETH } = await ERC20contract.call("balanceOf", payloadCall);
    const result = hexToDecimalString(toHex(uint256ToBN(balanceETH)));
    const result2 = BigInt(result);
    console.log("Amount of ETH in wallet address ", addrWallet, " =", LogC.fg.green, Number(result2) / 1E18, "ETH", LogC.reset, "\nUint256=", balanceETH, "| dec =", result);


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

