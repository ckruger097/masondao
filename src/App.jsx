import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork} from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { ChainId } from '@thirdweb-dev/sdk'
import { AddressZero } from "@ethersproject/constants";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import buffer from 'buffer';
import Collapsible from 'react-collapsible';
import TextField from "@material-ui/core/TextField"
// import { newTransferProposal } from "../scripts/10-create-vote-proposals.js"
// import newMintProposal from "../scripts/10-create-vote-proposals.js"

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  const network = useNetwork();

  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  const {Buffer} = buffer;
  window.Buffer = Buffer;

  // const provider = ethers.Wallet.createRandom();
  const sdk = new ThirdwebSDK();
  const contract = sdk.getNFTCollection("0x369409b220C7220e4651Ebd20A36B6F363757959");

  // Initialize our editionDrop contract
  const editionDrop = useEditionDrop("0xF5196121ad73CbfE61451CF128c71CB7A523876C");
    // Initialize our token contract
    const token = useToken("0xEAf02dE0D8Df901Eb230d1642366455989658d53")

    const vote = useVote("0x795845dD8D2d997a8e6D4899C082507f14f58F6c");

  // State variable for us to know if user has our NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

// Holds the amount of token each member has in state.
const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
// The array holding all of our members addresses.
const [memberAddresses, setMemberAddresses] = useState([]);

// A fancy function to shorten someones wallet address, no need to show the whole thing. 
const shortenAddress = (str) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

    const [proposals, setProposals] = useState([]);
const [isVoting, setIsVoting] = useState(false);
const [hasVoted, setHasVoted] = useState(false);

// Retrieve all our existing proposals from the contract.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // A simple call to vote.getAll() to grab the proposals.
  const getAllProposals = async () => {
    try {
      const proposals = await vote.getAll();
    console.log("🌈 Proposals:", proposals);

      setProposals(proposals);
    } catch (error) {
      console.log("failed to get proposals", error);
    }
  };
  getAllProposals();
}, [hasClaimedNFT, vote]);


// We also need to check if the user already voted.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // If we haven't finished retrieving the proposals from the useEffect above
  // then we can't check if the user voted yet!
  if (!proposals.length) {
    return;
  }

  const checkIfUserHasVoted = async () => {
    try {
      const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("🥵 User has already voted");
      } else {
        console.log("🙂 User has not voted yet");
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  };
  checkIfUserHasVoted();

}, [hasClaimedNFT, proposals, address, vote]);

// This useEffect grabs all the addresses of our members holding our NFT.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
  // with tokenId 0.
  const getAllAddresses = async () => {
    try {
      const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
      setMemberAddresses(memberAddresses);
      console.log("🚀 Members addresses", memberAddresses);
    } catch (error) {
      console.error("failed to get member list", error);
    }

  };
  getAllAddresses();
}, [hasClaimedNFT, editionDrop.history]);

// This useEffect grabs the # of token each member holds.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  const getAllBalances = async () => {
    try {
      const amounts = await token.history.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    } catch (error) {
      console.error("failed to get member balances", error);
    }
  };
  getAllBalances();
}, [hasClaimedNFT, token.history]);

// Now, we combine the memberAddresses and memberTokenAmounts into a single array
const memberList = useMemo(() => {
  return memberAddresses.map((address) => {
    // We're checking if we are finding the address in the memberTokenAmounts array.
    // If we are, we'll return the amount of token the user has.
    // Otherwise, return 0.
    const member = memberTokenAmounts?.find(({ holder }) => holder === address);
    const memberName = "MasonMember"  
    return {
      memberName,  
      address,
      tokenAmount: member?.balance.displayValue || "0",
    }
  });
}, [memberAddresses, memberTokenAmounts]);    

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1);
      const metadata = {
        name: "CS 499 NFT",
        description: "This is an NFT for CS 499",
        image: "https://cdn.discordapp.com/attachments/935710105306038352/965453931461365760/character5.png",
      };
    
      // const tx = await contract.mintTo(address, metadata);
      // const receipt = tx.receipt; // the transaction receipt
      // const tokenId = tx.id; // the id of the NFT minted
      // const nft = await tx.data(); // (optional) fetch details of minted NFT
      // console.log(nft);
      
      const startTime = new Date();
      const endTime = new Date(Date.now() + 60 * 60 * 24 * 1000);
      const payload = {
        metadata: metadata, // The NFT to mint
        to: address, // Who will receive the NFT (or AddressZero for anyone)
        price: 0.1, // the price to pay for minting
        //currencyAddress: NATIVE_TOKEN_ADDRESS, // the currency to pay with
        mintStartTime: startTime, // can mint anytime from now
        mintEndTime: endTime, // to 24h from now,
        //royaltyRecipient: "0x...", // custom royalty recipient for this NFT
        royaltyBps: 100, // custom royalty fees for this NFT (in bps)
        //primarySaleRecipient: "0x...", // custom sale recipient for this NFT
      };
      
      const signedPayload = contract.signature.generate(payload);

      contract.signature.mint(signedPayload);
    
      //console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

    if (address && (network?.[0].data.chain.id !== ChainId.Rinkeby)) {
  return (
    <div className="unsupported-network">
      <h2>Please connect to Rinkeby</h2>
      <p>
        This dapp only works on the Rinkeby network, please switch networks
        in your connected wallet.
      </p>
    </div>
  );
}

  const newProposal = async(amount, description, numTokens) => {
    if (!hasClaimedNFT){
      return;
    }
    // return newTransferProposal(amount, description, numTokens);
  };

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
  return (
    <div className="landing">
      <h1>Welcome to MasonDAO! 🟩🟨</h1>
         <h3>If you don't have a wallet, <a href = "https://metamask.io/" target="_blank">click here</a> before connecting</h3>
      <button onClick={connectWithMetamask} className="btn-hero">
        Connect your wallet
      </button>
    </div>
  );
}

// If the user has already claimed their NFT we want to display the interal DAO page to them
  // only DAO members will see this. Render all the members + token amounts.
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <b><font size="26">MasonDAO Dashboard: Welcome!</font></b>
        <center><img src="https://i.imgur.com/KdgIpCT.jpg" height="420" width="560" ></img></center>
        <p>Greetings, Patriot. Please remember to vote on all proposals within the 24 hour period they are proposed. Note: Voting will take multiple signatures. Please check the Discord for further information on proposals.</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Member Name</th>  
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{member.memberName}</td>  
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div>
            <h2>Proposals</h2>

              <Collapsible 
                trigger="New Proposals" 
                className="collapsible_button"
                >
                
                <div>
                  <TextField label = "# of Tokens" />
                </div>
                
                <div>
                  <TextField label = "Description" />
                </div>

                <div className="radioBlock">
                  <div className="radio-left">
                    <input type="radio" value="Transfer" name="transaction" />
                    <lable for="Transfer" >Transfer</lable>
                  </div>

                  <div className="radio-right">
                    <input type="radio" value="Mint" name="transaction" />
                    <lable for="Mint" className="radio-right">Mint</lable>
                  </div>
                  
                </div>
                
              </Collapsible>
            
              <Collapsible 
                trigger="Active Proposals" 
                className="collapsible_button"
                >
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
    
                    //before we do async things, we want to disable the button to prevent double clicks
                    setIsVoting(true);
    
                    // lets get the votes from the form for the values
                    const votes = proposals.map((proposal) => {
                      const voteResult = {
                        proposalId: proposal.proposalId,
                        //abstain by default
                        vote: 2,
                      };
                      proposal.votes.forEach((vote) => {
                        const elem = document.getElementById(
                          proposal.proposalId + "-" + vote.type
                        );
    
                        if (elem.checked) {
                          voteResult.vote = vote.type;
                          return;
                        }
                      });
                      return voteResult;
                    });
    
                    // first we need to make sure the user delegates their token to vote
                    try {
                      //we'll check if the wallet still needs to delegate their tokens before they can vote
                      const delegation = await token.getDelegationOf(address);
                      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                      if (delegation === AddressZero) {
                        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                        await token.delegateTo(address);
                      }
                      // then we need to vote on the proposals
                      try {
                        await Promise.all(
                          votes.map(async ({ proposalId, vote: _vote }) => {
                            // before voting we first need to check whether the proposal is open for voting
                            // we first need to get the latest state of the proposal
                            const proposal = await vote.get(proposalId);
                            // then we check if the proposal is open for voting (state === 1 means it is open)
                            if (proposal.state === 1) {
                              // if it is open for voting, we'll vote on it
                              return vote.vote(proposalId, _vote);
                            }
                            // if the proposal is not open for voting we just return nothing, letting us continue
                            return;
                          })
                        );
                        try {
                          // if any of the propsals are ready to be executed we'll need to execute them
                          // a proposal is ready to be executed if it is in state 4
                          await Promise.all(
                            votes.map(async ({ proposalId }) => {
                              // we'll first get the latest state of the proposal again, since we may have just voted before
                              const proposal = await vote.get(proposalId);
    
                              //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                              if (proposal.state === 4) {
                                return vote.execute(proposalId);
                              }
                            })
                          );
                          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                          setHasVoted(true);
                          // and log out a success message
                          console.log("successfully voted");
                        } catch (err) {
                          console.error("failed to execute votes", err);
                        }
                      } catch (err) {
                        console.error("failed to vote", err);
                      }
                    } catch (err) {
                      console.error("failed to delegate tokens");
                    } finally {
                      // in *either* case we need to set the isVoting state to false to enable the button again
                      setIsVoting(false);
                    }
                  }}
                >
                  {proposals.map((proposal) => (
                    <div key={proposal.proposalId} className="card">
                      <h5>{proposal.description}</h5>
                      <div>
                        {proposal.votes.map(({ type, label }) => (
                          <div key={type}>
                            <input
                              type="radio"
                              id={proposal.proposalId + "-" + type}
                              name={proposal.proposalId}
                              value={type}
                              //default the "abstain" vote to checked
                              defaultChecked={type === 2}
                            />
                            <label htmlFor={proposal.proposalId + "-" + type}>
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={isVoting || hasVoted} type="submit">
                    {isVoting
                      ? "Voting..."
                      : hasVoted
                        ? "You Already Voted"
                        : "Submit Votes"}
                  </button>
                  {!hasVoted && (
                    <small>
                      This will trigger multiple transactions that you will need to
                      sign.
                    </small>
                  )}
                </form>
            </Collapsible>
            
            <Collapsible 
              trigger="Expired Proposals" 
              className="collapsible_button"
            >
            </Collapsible>
            <div>
            <a href="https://discord.gg/Z8mbqwym7g">
            <center><img src="https://imgur.com/ZOKp8LH.jpg" alt="discord icon" height="50" width = "50" align="bottom"></img></center>
            </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your MasonDAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your MasonDAO Membership NFT"}
      </button>
    </div>
  );
}

export default App;