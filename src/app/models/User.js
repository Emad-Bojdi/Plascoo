import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'لطفا نام خود را وارد کنید'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'لطفا ایمیل را وارد کنید'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'لطفا یک ایمیل معتبر وارد کنید',
    ],
  },
  password: {
    type: String,
    required: [true, 'لطفا رمز عبور را وارد کنید'],
    minlength: [6, 'رمز عبور باید حداقل 6 کاراکتر باشد'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

// رمزنگاری پسورد قبل از ذخیره در دیتابیس
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// متد برای مقایسه رمز عبور ورودی با رمز ذخیره شده
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User; 