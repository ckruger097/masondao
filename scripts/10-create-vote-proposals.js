import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

// This is our governance contract.
const vote = sdk.getVote("0x795845dD8D2d997a8e6D4899C082507f14f58F6c");

// This is our ERC-20 contract.
const token = sdk.getToken("0xEAf02dE0D8Df901Eb230d1642366455989658d53");

// (async () => {
//   try {
//     // Create proposal to mint 850000 new token to the treasury.
      
//     const amount = 850_000;
//     const description = "Inflationary Proposal: Mint an additional " + amount + " MASON tokens into the treasury?";
//     const executions = [
//       {
//         // Our token contract that actually executes the mint.
//         toAddress: token.getAddress(),
//         // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
//         // to send in this proposal. In this case, we're sending 0 ETH.
//         // We're just minting new tokens to the treasury. So, set to 0.
//         nativeTokenValue: 0,
//         // We're doing a mint! And, we're minting to the vote, which is
//         // acting as our treasury.
//         // in this case, we need to use ethers.js to convert the amount
//         // to the correct format. This is because the amount it requires is in wei.
//         transactionData: token.encoder.encode(
//           "mintTo", [
//           vote.getAddress(),
//           ethers.utils.parseUnits(amount.toString(), 18),
//         ]
//         ),
//       }
//     ];

//     await vote.propose(description, executions);

//     console.log("✅ Successfully created proposal to mint tokens");
//   } catch (error) {
//     console.error("failed to create first proposal", error);
//     process.exit(1);
//   }

//   try {
//     // Create proposal to transfer ourselves 6,900 tokens for being awesome.
//     const amount = 1000;
//     const description = "Transfer Proposal: Transfer " + amount + " tokens from the treasury to Cameron (" +
//       process.env.WALLET_ADDRESS + ") as payment for administrative work performed for MasonDAO?";
//     const executions = [
//       {
//         // Again, we're sending ourselves 0 ETH. Just sending our own token.
//         nativeTokenValue: 0,
//         transactionData: token.encoder.encode(
//           // We're doing a transfer from the treasury to our wallet.
//           "transfer",
//           [
//             process.env.WALLET_ADDRESS,
//             ethers.utils.parseUnits(amount.toString(), 18),
//           ]
//         ),
//         toAddress: token.getAddress(),
//       },
//     ];

//     await vote.propose(description, executions);

//     console.log(
//       "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
//     );
//   } catch (error) {
//     console.error("failed to create second proposal", error);
//   }
// })();

async function newTransferProposal (amount, description, numTokens){
  try{
    const executions = [
    {
      nativeTokenValue: numTokens,
      transactionData: token.encoder.encode (
        "transfer",
        [
          process.env.WALLET_ADDRESS,
          ethers.utils.parseUnits(amount.toString(), 18),
        ]
      ),
      toAddress: token.getAddress(),
    },
  ];

  await vote.propose(description, executions);
  
  console.log(
      "✅ Successfully created proposal, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create proposal", error);
  }
}

async function newMintProposal (amount, description, numTokens){
  try{
    const executions = [
    {
      nativeTokenValue: numTokens,
      transactionData: token.encoder.encode (
        "mintTo",
        [
          vote.getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]
      ),
      toAddress: token.getAddress(),
    },
  ];

  await vote.propose(description, executions);
  
  console.log(
      "✅ Successfully created proposal, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create proposal", error);
  }
}

