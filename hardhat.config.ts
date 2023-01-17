import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
//import "./src/HHstarknetAbstractAccount";


// module.exports = {
//   solidity: "0.8.17",
// };
const config: HardhatUserConfig = {
  solidity: '0.8.17',
  starknet: {
    // dockerizedVersion: "0.8.2", // alternatively choose one of the two venv options below
    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    // venv: "path/to/my-venv",

    // uses the currently active Python environment (hopefully with available Starknet commands!)
    venv: "active",
    recompile: false,
    //network: "alpha" or "alpha-goerli-2" or "integrated-devnet" or "devnet" or "integratedDevnet",
    network: "devnet",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts"
      }
    }
  },
  networks: {
    devnet: {
      url: "http://127.0.0.1:5050",
      venv: "active"
    },
    integratedDevnet: {
      url: "http://127.0.0.1:5050",
      venv: "active"
      //dockerizedVersion: "0.2.2"

    },
    "alpha-goerli-2": {
      url: "https://alpha4-2.starknet.io"
    },
    hardhat: {}
  },
};

export default config;