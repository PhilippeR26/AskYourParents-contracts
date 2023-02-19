// compile cairo contracts from a typescript script.
// launch with : npx hardhat run src/merkleTree/compileMerkle.ts

import hardhat from "hardhat";

// compile a contract with the following options :
// hardhat.run("starknet-compile", {paths: ["contracts/contract.cairo","contracts/contracts2.cairo"], cairoPath:"cairolib1:cairolib2", disableHintValidation:true, accountContract:true});
// paths = files to compile
// cairoPath = dirs where the compiler can find libs for Cairo commands 'from ... import ...'
// disableHintValidation : for debug of Cairo contract
// accountContract : if contract is an account contract

async function main() {
    //await hardhat.run("starknet-compile", { paths: ["contracts/testData.cairo"], disableHintValidation: true });
    await hardhat.run("starknet-compile", { paths: ["contracts/merkle/merkle-verify.cairo"], disableHintValidation: true, accountContract: false });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });