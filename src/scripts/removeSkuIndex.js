const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function removeSkuIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the Product collection
    const collection = mongoose.connection.collection('products');
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop all indexes except _id
    try {
      await collection.dropIndexes();
      console.log('Successfully dropped all indexes');
      
      // Wait a moment to ensure MongoDB has processed the change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify indexes after removal
      const updatedIndexes = await collection.indexes();
      console.log('Updated indexes:', updatedIndexes);
      
      // Create a new non-unique index on SKU
      await collection.createIndex({ sku: 1 }, { unique: false, sparse: true });
      console.log('Created new non-unique index on SKU');
      
      // Final verification
      const finalIndexes = await collection.indexes();
      console.log('Final indexes:', finalIndexes);
    } catch (error) {
      console.error('Error during index operations:', error);
      throw error;
    }

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeSkuIndex(); 