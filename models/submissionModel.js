import mongoose, { Types } from 'mongoose';

const submissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input the name!']
  },
  script: {
    type: String,
    required:[true,"Please input the script"]
  },
  time: {
    type: String,
    required: [true, 'Please provide the expected time complexity!']
  },
  space: {
    type: String,
    required: [true, 'Please provide the expected space complexity!']
  },
  timestamp: {
    type: Date,
    Default : Date.now
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
