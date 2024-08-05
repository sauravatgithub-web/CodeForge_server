import { hash } from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import validator from 'validator';

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    questions: [
        {
            type: Types.ObjectId,
            ref: "Question",
        }
    ],
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
    batch: [{
        type: String,
    }]
});

// using middleware will help in not saving the confirm password
teacherSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = hash(this.password, 10);
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
