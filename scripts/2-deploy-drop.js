import { ethers } from "ethers";
import { AddressZero } from "@ethersproject/constants";

import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// const app = sdk.getAppModule("0xE1BCFd3347E9d498d398Ccf4b7791c44921fF66E");

(async () => {
  try {
    const editionDropAddress = sdk.deployer.deployEditionDrop({
      name: "MasonDAO Member",
      description: "Grants membership to MasonDAO: for Patriot Web3 builders. Logo credits to Port Design Co.",
      image: readFileSync("scripts/assets/gm.jpg"),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
      // 0x0 = no charge
      primary_sale_recipient: AddressZero,
    });
    
    
    // this initialization returns the address of our contract
    // we use this to initialize the contract on the thirdweb sdk
    const editionDrop = sdk.getEditionDrop(editionDropAddress);

    // with this, we can get the metadata of our contract
    const metadata = await editionDrop.metadata.get();

    console.log(
      "✅ Successfully deployed editionDrop contract, address:",
      editionDropAddress,
    );
    console.log("✅ editionDrop metadata:", metadata);
  } catch (error) {
    console.log("failed to deploy editionDrop contract", error);
  }
})();