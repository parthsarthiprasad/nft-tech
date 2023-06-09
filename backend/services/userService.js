// User service

const User = require('../models/user');

// Fetch user details by address
exports.getUserByAddress = async (address) => {
  const user = await User.findOne({ address });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Add an NFT to the user's cart
exports.addNFTToCart = async (userAddress, nftTokenId) => {
  const user = await User.findOne({ address: userAddress });
  if (!user) {
    throw new Error('User not found');
  }

  const cartItem = user.cart.find((item) => item.nftTokenId === nftTokenId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    user.cart.push({ nftTokenId });
  }

  await user.save();

  return user;
};

// Remove an NFT from the user's cart
exports.removeNFTFromCart = async (userAddress, nftTokenId) => {
  const user = await User.findOne({ address: userAddress });
  if (!user) {
    throw new Error('User not found');
  }

  const cartItem = user.cart.find((item) => item.nftTokenId === nftTokenId);
  if (cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      user.cart.pull(cartItem);
    }
  }

  await user.save();

  return user;
};
