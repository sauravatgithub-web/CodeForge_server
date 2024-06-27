import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  rollNumber: {
    type: String,
    required: [true, "Please provide a roll number"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type : String,
    default : 'default.jpg'
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  questionsSolved: [
    {
      type: Types.ObjectId,
      ref: "Question",
    }
  ],
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  secretQuestion: {
    type: String,
    required: [true, "Please enter a secret question"],
    required: true,
  },
  secretAnswer: {
    type: String,
    required: [true, "Please enter a secret answer"],
    required: true,
  },
  github: {
    type: String,
    default: "",
  },
  linkedin: {
    type: String,
    default: "",
  },
  leetcode: {
    type: String,
    default: "",
  },
  codechef: {
    type: String,
    default: "",
  },
  codeforces: {
    type: String,
    default: "",
  }
});

// using middleware will help in not saving the confirm password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  this.password = await hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);

export default User;
