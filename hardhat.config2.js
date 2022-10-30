require("@shardlabs/starknet-hardhat-plugin");

module.exports = {
  solidity: '0.8.17',
  starknet: {
    // dockerizedVersion: "0.8.2", // alternatively choose one of the two venv options below
    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    // venv: "path/to/my-venv",

    // uses the currently active Python environment (hopefully with available Starknet commands!)
    venv: "active",
    recompile: false,
    //network: "alpha" or "integrated-devnet" or "devnet" or "integratedDevnet",
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
    hardhat: {}
  },
};
