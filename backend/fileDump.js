const express = require('express');
const app = express();
const Web3 = require('web3');
const contractABI = require('./contractABI.json'); // Replace with your contract's ABI
const contractAddress = '0x123456789...'; // Replace with your contract's address
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura project ID or other Ethereum provider
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to parse JSON requests
app.use(express.json());

// JWT secret key
const jwtSecretKey = 'YOUR_JWT_SECRET_KEY';

// MongoDB configuration
const mongoURI = 'mongodb://localhost:27017'; // Replace with your MongoDB connection URI
const dbName = 'loyaltyapp'; // Replace with your database name

// API route for user registration
app.post('/register', async (req, res) => {
  try {
    const { address, password } = req.body;

    // Check if the user already exists
    const existingUser = await getUserByAddress(address);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    await createUser(address, hashedPassword);

    // Return success message
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// API route for user login
app.post('/login', async (req, res) => {
  try {
    const { address, password } = req.body;

    // Check if the user exists
    const user = await getUserByAddress(address);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ address }, jwtSecretKey);

    // Return the token
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Middleware to authenticate requests
function authenticate(req, res, next) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the token
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Attach the user address to the request
      req.userAddress = decoded.address;

      // Proceed to the next middleware
      next();
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Error authenticating user' });
  }
}

// API route for fetching user details
app.get('/user', authenticate, async (req, res) => {
  try {
    const user = await getUserByAddress(req.userAddress);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the user's loyalty details
    const loyaltyDetails = await getLoyaltyDetails(req.userAddress);

    // Return the user and loyalty details
    res.json({ user, loyaltyDetails });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
});

// API route for minting NFTs
app.post('/mint-nft', authenticate, async (req, res) => {
  try {
    const { recipient } = req.body;

    // Load the contract
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Mint the NFT for the recipient
    const result = await contract.methods.mintNFT(recipient).send({ from: 'YOUR_WALLET_ADDRESS' }); // Replace with your wallet address

    // Update user loyalty details in MongoDB
    await updateLoyaltyDetails(recipient);

    // Return the transaction result
    res.json({ transactionHash: result.transactionHash });
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: 'Error minting NFT' });
  }
});

// API route for adding NFT to cart
app.post('/cart/add-nft', authenticate, async (req, res) => {
  try {
    const { nftTokenId } = req.body;
    const user = await getUserByAddress(req.userAddress);

    // Check if the user's loyalty level is eligible for adding NFT to the cart
    if (user.loyaltyLevel !== 'Gold') {
      return res.status(400).json({ error: 'Only Gold level users can add NFT to the cart' });
    }

    // Add the NFT to the user's cart
    const updatedUser = await addToCart(req.userAddress, nftTokenId);

    // Return the updated user
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error adding NFT to cart:', error);
    res.status(500).json({ error: 'Error adding NFT to cart' });
  }
});

// API route for removing NFT from cart
app.post('/cart/remove-nft', authenticate, async (req, res) => {
  try {
    const { nftTokenId } = req.body;

    // Remove the NFT from the user's cart
    const updatedUser = await removeFromCart(req.userAddress, nftTokenId);

    // Return the updated user
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error removing NFT from cart:', error);
    res.status(500).json({ error: 'Error removing NFT from cart' });
  }
});

// Store user details in MongoDB
async function createUser(address, password) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Perform the database operations
    const user = {
      address,
      password,
      cart: [], // Initialize an empty cart
    };
    await usersCollection.insertOne(user);
  } finally {
    await client.close();
  }
}

// Fetch user details from MongoDB by address
async function getUserByAddress(address) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Perform the database operations
    const user = await usersCollection.findOne({ address });
    return user;
  } finally {
    await client.close();
  }
}

// Store loyalty details in MongoDB
async function storeLoyaltyDetails(address, purchaseCount, loyaltyLevel, nftTokenId) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const loyaltyCollection = db.collection('loyalty');

    // Perform the database operations
    const loyaltyDetails = {
      address,
      purchaseCount,
      loyaltyLevel,
      nftTokenId,
    };
    await loyaltyCollection.insertOne(loyaltyDetails);
  } finally {
    await client.close();
  }
}

// Update user loyalty details in MongoDB
async function updateLoyaltyDetails(address) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const loyaltyCollection = db.collection('loyalty');

    // Perform the database operations
    const user = await loyaltyCollection.findOne({ address });
    let loyaltyLevel = user.loyaltyLevel;
    let nftTokenId = user.nftTokenId;

    // Update loyalty level and NFT token ID based on conditions
    if (user.purchaseCount >= 10 && user.purchaseCount < 20) {
      loyaltyLevel = 'Silver';
      nftTokenId = 100; // Replace with the specific NFT token ID for Silver level
    } else if (user.purchaseCount >= 20) {
      loyaltyLevel = 'Gold';
      nftTokenId = 200; // Replace with the specific NFT token ID for Gold level
    }

    await loyaltyCollection.updateOne({ address }, { $set: { loyaltyLevel, nftTokenId } });
  } finally {
    await client.close();
  }
}

// Fetch loyalty details from MongoDB by address
async function getLoyaltyDetails(address) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const loyaltyCollection = db.collection('loyalty');

    // Perform the database operations
    const loyaltyDetails = await loyaltyCollection.findOne({ address });
    return loyaltyDetails;
  } finally {
    await client.close();
  }
}

// Add NFT to the user's cart
async function addToCart(address, nftTokenId) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Perform the database operations
    const user = await usersCollection.findOne({ address });
    const cart = user.cart;

    // Check if the NFT is already in the cart
    const existingItem = cart.find(item => item.nftTokenId === nftTokenId);
    if (existingItem) {
      return user; // NFT already in the cart, return the user as is
    }

    // Add the NFT to the cart
    cart.push({ nftTokenId });

    // Update the user's cart in the database
    await usersCollection.updateOne({ address }, { $set: { cart } });

    // Return the updated user
    return await usersCollection.findOne({ address });
  } finally {
    await client.close();
  }
}

// Remove NFT from the user's cart
async function removeFromCart(address, nftTokenId) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Perform the database operations
    const user = await usersCollection.findOne({ address });
    const cart = user.cart;

    // Find the index of the NFT in the cart
    const index = cart.findIndex(item => item.nftTokenId === nftTokenId);
    if (index === -1) {
      return user; // NFT not found in the cart, return the user as is
    }

    // Remove the NFT from the cart
    cart.splice(index, 1);

    // Update the user's cart in the database
    await usersCollection.updateOne({ address }, { $set: { cart } });

    // Return the updated user
    return await usersCollection.findOne({ address });
  } finally {
    await client.close();
  }
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
