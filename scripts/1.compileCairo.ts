// compileCairo.ts
// compile cairo contracts from a typescript script.
// launch with : npx hardhat run scripts/1.compileCairo.ts

import hardhat from "hardhat";

// compile a contract with the following options :
// hardhat.run("starknet-compile", {paths: ["contracts/contract.cairo","contracts/contracts2.cairo"], cairoPath:"cairolib1:cairolib2", disableHintValidation:true, accountContract:true});
// paths = files to compile
// cairoPath = dirs where the compiler can find libs for Cairo commands 'from ... import ...'
// disableHintValidation : for debug of Cairo contract
// accountContract : if contract is an account contract

async function main() {
    //await hardhat.run("starknet-compile", { paths: ["contracts/listAdmin.cairo"], disableHintValidation: true });
    await hardhat.run("starknet-compile", { paths: ["contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo"], disableHintValidation: true, accountContract: true });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });