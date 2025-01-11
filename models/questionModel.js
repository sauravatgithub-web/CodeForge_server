import mongoose, { Types } from "mongoose";

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please give a title to the question!']
  },
  description: {
    type: String,
    required: [true, 'Please provide the question description!']
  },
  tags: {
    type: [String],
    required: [true, 'Please provide tags']
  },
  testCase: {
    type: [String],
    validate: {
      validator: (arr) => arr.length >= 5,
      message: 'Please provide atleast 5 test cases!'
    },
    required: [true, 'Please provide test cases!']
  },
  answer: {
    type: [String],
    required: [true, 'Please provide the answer of test cases!'],
    validate: {
      validator: function (arr) {
        return arr.length === this.testCase.length;
      },
      message: 'The number of answers must match the number of test cases!'
    }
  },
  hints: {
    type: [String],
  },
  constraints: {
    type: String,
    required: [true, 'Please provide the constraints for the question!']
  },
  time: {
    type: String,
    required: [true, 'Please provide the expected time complexity!']
  },
  space: {
    type: String,
    required: [true, 'Please provide the expected space complexity!']
  },
  labId: {
    type: Types.ObjectId,
    ref: "Lab"
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
