import sdk from "./1-initialize-sdk.js";

// This is our governance contract.
const vote = sdk.getVote("0x795845dD8D2d997a8e6D4899C082507f14f58F6c");

// This is our ERC-20 contract.
const token = sdk.getToken("0xEAf02dE0D8Df901Eb230d1642366455989658d53");

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await token.balanceOf(
      process.env.WALLET_ADDRESS
    );

    const ownedAmount = ownedTokenBalance.displayValue;
    const sometokens = 1000;

    
    await token.transfer(
      vote.getAddress(),
      sometokens
    ); 

    console.log("✅ Successfully transferred " + sometokens + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();