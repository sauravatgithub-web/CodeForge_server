import mongoose, { Schema, Types } from 'mongoose';

const batchSchema = new Schema({
    name: { 
        type: String 
    },
    teacher: { 
        type: Types.ObjectId, 
        ref: "Teacher" 
    },
    students: [
        { 
            type: Types.ObjectId, 
            ref: "User" 
        }
    ],
    labs: [
        { 
            type: Types.ObjectId, 
            ref: "Lab" 
        }
    ],
    report: [{
        type : Object
    }]
});

batchSchema.methods.updateTotalScore = function () {
    this.report.forEach(student => {
        student.totalScore = Object.entries(student)
            .filter(([key, val]) => key.startsWith("lab") && typeof val === "number" && !isNaN(val))
            .reduce((sum, [, val]) => sum + val, 0);
    });
};

batchSchema.pre('save', function (next) {
    this.updateTotalScore();
    next();
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;