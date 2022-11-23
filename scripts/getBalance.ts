// function to obtain the amount of ETH available in a wallet
import { starknet } from "hardhat";
import type { StringMap } from "hardhat/types/runtime";
import { uint256ToBN } from "starknet/dist/utils/uint256";
import { toHex, hexToDecimalString } from "starknet/dist/utils/number";


export async function getETHinWallet(addressWallet: string, addressETH: string): Promise<bigint> {
    const ERC20source = await starknet.getContractFactory("starknet-artifacts/contracts/openzeppelin/token/erc20/presets/ERC20.cairo");
    const ERC20contract = ERC20source.getContractAt(addressETH);
    const payloadCall: StringMap = { account: BigInt(addressWallet) };
    const { balance: balanceETH } = await ERC20contract.call("balanceOf", payloadCall);
    const result = hexToDecimalString(toHex(uint256ToBN(balanceETH)));
    const result2 = BigInt(result);
    return result2;
};