const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function removeSkuIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the Product collection
    const collection = mongoose.connection.collection('products');
    
    // Drop the unique index on SKU field
    await collection.dropIndex('sku_1');
    console.log('Successfully removed unique index on SKU field');

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeSkuIndex(); 