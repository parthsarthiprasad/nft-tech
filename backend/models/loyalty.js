// Loyalty model

const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  loyaltyLevel: {
    type: String,
    required: true,
  },
  loyaltyPoints: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Loyalty = mongoose.model('Loyalty', loyaltySchema);

module.exports = Loyalty;
