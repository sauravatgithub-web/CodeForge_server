import mongoose, { Types } from 'mongoose';

const labSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Please give a topic']
    },
    batch: {
        type: String,
        required: [true, "Please enter a batch"],
        unique: true,
    },
    questions: [
        {
            type: Types.ObjectId,
            ref: "Question",
        }
    ],
    successfulSubmissions: [
        {
            submissionIds : [
                {
                    type: Types.ObjectId,
                    ref: "User",
                }
            ]
        }
    ],
    duration: {
        type : String,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Lab = mongoose.model('Lab', labSchema);

export default Lab;
