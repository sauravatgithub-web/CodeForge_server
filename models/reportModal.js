import mongoose, { Types } from 'mongoose';

const reportSchema = new mongoose.Schema({
    name: { type: String },
    rollNumber: { type: String },
    studentName: { type: String },
    questions: [
        {
            questionId: { type: Types.ObjectId, ref: "Question" },
            count: { type: Number },
            script: { type: String },
        }
    ]
});


const Report = mongoose.model('Report', reportSchema);

export default Report;