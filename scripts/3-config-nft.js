import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0xF5196121ad73CbfE61451CF128c71CB7A523876C");


(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "MasonDAO Starship",
        description: "A friendly Starship brings you... access to MasonDAO.",
        image: readFileSync("scripts/assets/starship.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()