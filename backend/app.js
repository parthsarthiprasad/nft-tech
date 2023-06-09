const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const nftRoutes = require('./routes/nftRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/nfts', nftRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});
