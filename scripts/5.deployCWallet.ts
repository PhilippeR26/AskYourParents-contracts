// deploy the Children wallet to the current hardhat starknet network (devnet or alpha).
// 
import hre from "hardhat";
import LogC from "../src/logColors";
import { starknet } from "hardhat";
import { AAccount } from "hardhat";
import { adaptAddress } from "../src/util";
import { Account } from "../src/HHstarknetAbstractAccount/accountAA";
import * as dotenv from 'dotenv';
import { addrParentAlpha, addrParentAlpha2 } from "../src/const";
import axios from "axios";
dotenv.config({ path: "../.env" });


async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network :", LogC.fg.yellow, whichNetwork, LogC.reset);
    // deploy Children Account
    let parentAccountAddress: string;
    let childrenAccount: Account;
    switch (whichNetwork) {
        case "devnet":
            const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
            parentAccountAddress = ListOfWallet[0].address;
            childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { super_admin_address: parentAccountAddress }, { salt: "0x00", privateKey: "0x01" });
            // Feed account with 50 ETH (let be generous!)
            const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": childrenAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
            console.log('Answer mint =', answer);
            break;
        case "alpha":
            parentAccountAddress = addrParentAlpha;
            childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { super_admin_address: parentAccountAddress });
            break;
        case "alpha-goerli-2":
            parentAccountAddress = addrParentAlpha2;
            childrenAccount = await AAccount.deployAccountAA("ChildrenAA", { super_admin_address: parentAccountAddress });
            break;
        default:
            throw new Error("IntegratedDevnet and mainnet not authorized for this script!");
    }
    const childrenAccountAddress = adaptAddress(childrenAccount.address);
    const childrenAccountPrivateKey = childrenAccount.privateKey;
    // get super admninstrator address
    const ChildrenAAFactory = await starknet.getContractFactory("contracts/accountAA_contracts/ChildrenAA/v1_0_0/myAccountAbstraction.cairo");
    const childrenContract = ChildrenAAFactory.getContractAt(childrenAccount.address);
    const { super_admin_addr: addrBigInt } = await childrenContract.call("get_super_admin");
    const childrenAccountSuperAdminAddress: string = "0x" + addrBigInt.toString(16);

    console.log("✅ Children wallet address=", childrenAccountAddress, "\n  Copy/Paste this address in src/const.ts, in varName", whichNetwork === "alpha-goerli-2" ? "addrChildrenAlpha2" : whichNetwork === "alpha" ? "addrChildrenAlpha" : "addrChildrenDevnet");
    console.log("\n  Children wallet private key=", childrenAccountPrivateKey, "\nCopy/Paste this key in .env file, in varName", whichNetwork === "alpha-goerli-2" ? "OZ_CHILDREN_ACCOUNT2_PRIVATE_KEY" : whichNetwork === "alpha" ? "OZ_CHILDREN_ACCOUNT_PRIVATE_KEY" : "OZ_CHILDREN_ACCOUNTD_PRIVATE_KEY");
    console.log("Super admin address =", childrenAccountSuperAdminAddress);
    if (whichNetwork != "devnet") { console.log("⚠️", LogC.fg.green, "Send some Goerli ETH (0.01 ETH is enough to start) to this wallet, prior to proceed.", LogC.reset); }
    console.log(LogC.bright, LogC.fg.yellow, LogC.bg.black, "Deployment completed with success.", LogC.reset);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

