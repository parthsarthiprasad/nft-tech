// NFT service

const User = require('../models/user');
const Web3 = require('web3');

// Ethereum provider URL
const ethereumProviderUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';

// Create a web3 instance
const web3 = new Web3(ethereumProviderUrl);





// Gift an NFT to a recipient
exports.giftNFT = async (senderAddress, recipientAddress, nftTokenId) => {
  const sender = await User.findOne({ address: senderAddress });
  const recipient = await User.findOne({ address: recipientAddress });

  if (!sender || !recipient) {
    throw new Error('Sender or recipient not found');
  }

  const hasNFT = sender.nfts.includes(nftTokenId);
  if (!hasNFT) {
    throw new Error('You do not own the specified NFT');
  }

  // Remove the NFT from the sender's possession
  sender.nfts.pull(nftTokenId);
  await sender.save();

  // Add the NFT to the recipient's possession
  recipient.nfts.push(nftTokenId);
  await recipient.save();

  return recipient;
};

// Exchange NFTs between sender and recipient
exports.exchangeNFTs = async (senderAddress, recipientAddress, nftTokenId) => {
  const sender = await User.findOne({ address: senderAddress });
  const recipient = await User.findOne({ address: recipientAddress });

  if (!sender || !recipient) {
    throw new Error('Sender or recipient not found');
  }

  const senderHasNFT = sender.nfts.includes(nftTokenId);
  const recipientHasNFT = recipient.nfts.includes(nftTokenId);
  if (!senderHasNFT || !recipientHasNFT) {
    throw new Error('NFT not found or not owned by the specified users');
  }

  // Remove the NFT from the sender's possession
  sender.nfts.pull(nftTokenId);
  await sender.save();

  // Remove the NFT from the recipient's possession
  recipient.nfts.pull(nftTokenId);
  await recipient.save();

  // Transfer the NFT ownership
  sender.nfts.push(nftTokenId);
  await sender.save();

  // Transfer the NFT ownership
  recipient.nfts.push(nftTokenId);
  await recipient.save();
};

// Mint an NFT
exports.mintNFT = async (toAddress, nftTokenId) => {
    // Load the NFT smart contract ABI and address
    const nftContractAddress = '0x123456789ABCDEF'; // Replace with your NFT contract address
    const nftContractABI = [...]; // Replace with your NFT contract ABI
  
    // Create an instance of the NFT contract
    const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);
  
    // Call the mint function on the NFT contract
    await nftContract.methods.mint(toAddress, nftTokenId).send({ from: '0xYOUR_ADDRESS' }); // Replace with your address
  
    // Return the transaction hash or any other relevant information
  };
  
  // Transfer an NFT
  exports.transferNFT = async (fromAddress, toAddress, nftTokenId) => {
    // Load the NFT smart contract ABI and address
    const nftContractAddress = '0x123456789ABCDEF'; // Replace with your NFT contract address
    const nftContractABI = [...]; // Replace with your NFT contract ABI
  
    // Create an instance of the NFT contract
    const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);
  
    // Call the transfer function on the NFT contract
    await nftContract.methods.transferFrom(fromAddress, toAddress, nftTokenId).send({ from: '0xYOUR_ADDRESS' }); // Replace with your address
  
    // Return the transaction hash or any other relevant information
  };


  // Existing code


// Gift an NFT to a recipient
exports.giftNFT = async (senderAddress, recipientAddress, nftTokenId) => {
  // Existing code

  // Call the NFT smart contract function to gift the NFT
  try {
    await nftContract.methods.giftNFT(recipientAddress, nftTokenId).send({ from: senderAddress });
    // Update recipient information or perform other necessary actions

    return recipient;
  } catch (error) {
    console.error('Error gifting NFT:', error);
    throw new Error('Error gifting NFT');
  }
};

// Exchange an NFT between users
exports.exchangeNFTs = async (senderAddress, recipientAddress, nftTokenId) => {
  // Existing code

  // Call the NFT smart contract function to exchange the NFTs
  try {
    await nftContract.methods.exchangeNFTs(senderAddress, recipientAddress, nftTokenId).send({ from: senderAddress });
    // Update recipient information or perform other necessary actions

    return recipient;
  } catch (error) {
    console.error('Error exchanging NFTs:', error);
    throw new Error('Error exchanging NFTs');
  }
};

...

  
  // Other functions to interact with the NFT smart contract...
  