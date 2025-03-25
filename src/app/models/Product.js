const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام محصول الزامی است'],
    trim: true
  },
  retailPrice: {
    type: Number,
    required: [true, 'قیمت خرده فروشی الزامی است'],
    min: [0, 'قیمت نمی‌تواند منفی باشد']
  },
  wholesalePrice: {
    type: Number,
    required: [true, 'قیمت عمده فروشی الزامی است'],
    min: [0, 'قیمت نمی‌تواند منفی باشد']
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true,

  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema); 