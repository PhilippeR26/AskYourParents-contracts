// compileCairo.ts
// compile cairo contracts from a typescript script.

import hardhat from "hardhat";

// compile a contract with the following options :
// hardhat.run("starknet-compile", {paths: ["contracts/contract.cairo","contracts/contracts2.cairo"], cairoPath:"cairolib1:cairolib2", disableHintValidation:true, accountContract:true});
// paths = files to compile
// cairoPath = dirs where the compiler can find libs for Cairo commands 'from ... import ...'
// disableHintValidation : for debug of Cairo contract
// accountContract : if contract is an account contract

async function main() {
    await hardhat.run("starknet-compile", { paths: ["contracts/deployer/myUniversalDeployer.cairo", "contracts/openzeppelin/token/erc20/presets/ERC20Mintable.cairo"], disableHintValidation: true });
    await hardhat.run("starknet-compile", { paths: ["contracts/accountAA_contracts/ChildrenAA/v1_0_0/ChildrenAccount.cairo"], disableHintValidation: true, accountContract: true });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });