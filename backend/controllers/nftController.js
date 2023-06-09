// NFT controller

const nftService = require('../services/nftService');

// Gift an NFT to a recipient
exports.giftNFT = async (req, res) => {
  try {
    // Get the recipient and NFT token ID from the request body
    const { recipient, nftTokenId } = req.body;

    // Gift the NFT to the recipient
    const updatedUser = await nftService.giftNFT(req.userAddress, recipient, nftTokenId);

    // Return the updated user object
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error gifting NFT:', error);
    res.status(500).json({ error: 'Error gifting NFT' });
  }
};

// Exchange NFTs between sender and recipient
exports.exchangeNFTs = async (req, res) => {
  try {
    // Get the recipient and NFT token ID from the request body
    const { recipient, nftTokenId } = req.body;

    // Exchange NFTs between sender and recipient
    await nftService.exchangeNFTs(req.userAddress, recipient, nftTokenId);

    // Return success message
    res.json({ message: 'NFT exchange successful' });
  } catch (error) {
    console.error('Error exchanging NFT:', error);
    res.status(500).json({ error: 'Error exchanging NFT' });
  }
};
