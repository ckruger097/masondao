import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";
import { Component } from "react";


// This is our governance contract.
const vote = sdk.getVote("0x795845dD8D2d997a8e6D4899C082507f14f58F6c");

// This is our ERC-20 contract.
const token = sdk.getToken("0xEAf02dE0D8Df901Eb230d1642366455989658d53");

(async () => {

  try {
    // Create proposal to transfer ourselves 6,900 tokens for being awesome.
    const amount = 55_000;
    const description = "Payment Proposal: Send " + amount + " MasonDAO tokens to Parham as payment for frontend work? ";
    const executions = [
      {
        
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're burning the tokens by sending them to address 0
          "transfer",
          [
            "0xe60384DBa749283934EC70899281Df4683A562E1",
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to send tokens from treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();

