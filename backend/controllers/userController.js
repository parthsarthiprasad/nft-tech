// User controller

const userService = require('../services/userService');

// Fetch user details
exports.getUserDetails = async (req, res) => {
  try {
    // Get the user address from the request object
    const { address } = req.user;

    // Fetch user details
    const user = await userService.getUserByAddress(address);

    // Return the user object
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
};

// Add an NFT to the user's cart
exports.addNFTToCart = async (req, res) => {
  try {
    // Get the NFT token ID from the request body
    const { nftTokenId } = req.body;

    // Add the NFT to the user's cart
    const updatedUser = await userService.addNFTToCart(req.user.address, nftTokenId);

    // Return the updated user object
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error adding NFT to cart:', error);
    res.status(500).json({ error: 'Error adding NFT to cart' });
  }
};

// Remove an NFT from the user's cart
exports.removeNFTFromCart = async (req, res) => {
  try {
    // Get the NFT token ID from the request body
    const { nftTokenId } = req.body;

    // Remove the NFT from the user's cart
    const updatedUser = await userService.removeNFTFromCart(req.user.address, nftTokenId);

    // Return the updated user object
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error removing NFT from cart:', error);
    res.status(500).json({ error: 'Error removing NFT from cart' });
  }
};
