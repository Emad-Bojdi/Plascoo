import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'لطفا نام محصول را وارد کنید'],
    trim: true,
  },
  retailPrice: {
    type: Number,
    required: [true, 'لطفا قیمت تکی را وارد کنید'],
  },
  wholesalePrice: {
    type: Number,
    required: [true, 'لطفا قیمت عمده را وارد کنید'],
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  brand: {
    type: String,
    default: 'متفرقه',
  },
}, { 
  timestamps: true 
});

// اگر مدل قبلاً وجود دارد از آن استفاده کن، در غیر این صورت یک مدل جدید بساز
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product; 