import mongoose from 'mongoose';

const toySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'نام اسباب بازی الزامی است'],
    trim: true
  },
  purchasePrice: {
    type: Number,
    required: false,
    min: [0, 'قیمت خرید نمی‌تواند منفی باشد']
  },
  wholesalePrice: {
    type: Number,
    required: false,
    min: [0, 'قیمت عمده نمی‌تواند منفی باشد']
  },
  retailPrice: {
    type: Number,
    required: [true, 'قیمت تکی الزامی است'],
    min: [0, 'قیمت تکی نمی‌تواند منفی باشد']
  },
  
  brand: {
    type: String,
    default: '',
  },
  sku: {
    type: String,
    trim: true,
    unique: false,
    sparse: true
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

// به‌روزرسانی خودکار updatedAt
toySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Toy = mongoose.models.Toy || mongoose.model('Toy', toySchema);

export default Toy; 