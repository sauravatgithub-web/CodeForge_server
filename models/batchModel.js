import mongoose, { Types } from 'mongoose';

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    teacher: {
        type: Types.ObjectId,
        ref: "Teacher",
    },
    students: [
        {
            type: Types.ObjectId,
            ref: "User",
        }
    ],
    labs: [
        {
            type: Types.ObjectId,
            ref: "Lab",
        }
    ],
    report: [
        { type: Object }
    ]
});

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;
