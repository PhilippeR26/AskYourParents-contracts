#  💰 AskYourParents-contracts 💰 
## STARKNET CAIRO contracts for AskYourParents DAPP

DAPP UI source code available [here](https://github.com/PhilippeR26/AskYourParents-UI) 

⚠️Attention⚠️ : highly experimental DAPP. Use at your own risks.

This DAPP is a demonstration of account abstraction on Starknet Network.
A Children wallet is managed by the parents.

the Children wallet can be paused, withdrawed or spent limited by the Parent wallet.

A Game wallet can access to the Children wallet with rules defined by the Parent wallet.

🚧 In local devnet, the DAPP use :

- the predeployed OpenZeppelin wallet #0 for the Parent wallet.
- the predeployed OpenZeppelin wallet #1 for the Game wallet.
- the predeployed ERC20 ETH contract.
- a deployed ERC20 ECU token contract.
- a deployed Children abstracted wallet.

😴 In alpha testnet Goerli ETH, the DAPP use :

- A deployed OpenZeppelin wallet for the Parent wallet.
- A deployed OpenZeppelin wallet for the Game wallet (both to feed ; 0.01 Goerli ETH each is enough to start).
- the predeployed ERC20 ETH contract.
- a deployed ERC20 ECU token contract.
- a deployed Children abstracted wallet.

## 📦 Installation  📦
 Pull the Github project to your computer.
 Use `cd AskYourParents-contracts` to go to the root of the project.
 Run `npm install` in this directory.

 These tests have been written with cairo v0.10.1, starknet-devnet v0.3.5, starknet-hardhat-plugin v0.6.8. Due to fast iterations of Starknet and Cairo ; they will probably be quickly out-of-date.



>Note : by default, the tests are in the local Devnet. You can also test in the Starknet Alpha Goerli testnet, by changing `network: "devnet"` to `network: "alpha"` in hardhat.config.ts, without launching starknet-devnet. Just be very patient 😴 with this network.

### Install in devnet
Open a console, and launch the devnet `starknet-devnet --seed 0`. It will launch a local Starknet network, and pre-deploy some accounts.
In the `scripts` directory, you have 4 scripts to initialise the devnet.
In a second terminal :
```
npx hardhat run scripts/1.compileCairo.ts
npx hardhat run scripts/3.deployDeployer.ts
npx hardhat run scripts/4.deployECU.ts
npx hardhat run scripts/5.deployCWallet.ts
```

### Install in Alpha Goerli testnet
All the contracts are already deployed on Alpha Testnet ; their address are in `/src.const.ts`.The hereunder instructions are usefull if you have modified the cairo contracts.

In the `scripts directory`, you have 5 scripts to initialize the testnet.
In a second terminal :
```
npx hardhat run scripts/1.compileCairo.ts
npx hardhat run scripts/2.deployOZwallets.ts
npx hardhat run scripts/3.deployDeployer.ts
npx hardhat run scripts/4.deployECU.ts
npx hardhat run scripts/5.deployCWallet.ts
```
Each time, follow carefully 🔍 the instructions (copy/paste of addresses, funding of wallets, ...).

##  🚀 Start the test 🚀  🎆 ↘️  💩

Open a new console, and use `npx hardhat test test/essai1.ts`. 

## debug
If you use VSCODE, this project is configured to be able to debug the .ts files. You have just to edit the .vscode/launch.json file.
- For scripts : in the `npx hardhat RUN starknet` item. Change the ts file name.
- For tests : in the `npx hardhat TEST starknet` item. Change the ts file name.
Put your beakpoints in the code (F9).
to start : CTRL+SHIFT+D, select your config and press the play button (or F5).

## 📜 license
MIT license.

## 🙏 Inspiration
The Accounts and ERC20 contracts used in this workshop are made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts), contracts version 0.5.0.
The Children account is a modified OpenZeppelin contract.