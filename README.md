#  💰 AskYourParents-contracts 💰 
## STARKNET CAIRO contracts for AskYourParents DAPP

DAPP source code available [here](https://github.com/PhilippeR26/AskYourParents-UI) 

Attention : highly experimental DAPP. Use at your own risks.

This DAPP is a demonstration of account abstraction on Starknet Network.
A Children wallet is managed by the parents.

the Children wallet can be paused, withdrawed or spent limited by the Parent wallet.

A Game wallet can access to the Children wallet with rules defined by the Parent wallet.

In local devnet, the DAPP use :

- the predeployed OpenZeppelin wallet #0 for the Parent wallet.
- the predeployed OpenZeppelin wallet #1 for the Game wallet.
- the predeployed ERC20 ETH contract.
- a deployed ERC20 ECU token contract.
- a deployed Children abstracted wallet.


## 🛠️ Installation  :pick:
 Use `cd AskYourParents-contracts` to go to the root of the project.
 Run `npm install` in this directory.

 These tests have been written with cairo v0.10.1, starknet-devnet v0.3.4, starknet-hardhat-plugin v0.6.6. Due to fast iterations of Starknet and Cairo ; they will probably be quickly out-of-date.

The Account and ERC20 contracts used in this workshop are made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts), contracts version 0.4.0.

##  🚀 Start the test 🚀  🎆 ↘️  💩

Open a console, and launch the devnet `starknet-devnet --seed 0`. It will launch a local Starknet network, and pre-deploy some accounts.

>Note that you can test in the Starknet Alpha testnet, by changing `network: "devnet"` to `network: "alpha"` in hardhat.config.ts, without using starknet-devnet. Just be very patient 😴 with this network.

Open a second console, and use `npx hardhat run src/deployECU.ts`. it will deploy the ERC20 ECU contract.


