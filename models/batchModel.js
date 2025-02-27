import mongoose, { Schema, Types } from 'mongoose';

const reportSchema = new Schema({
    rollNumber: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    totalScore: { 
        type: Number, 
        default: 0 
    }, 
}, { _id: false });

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
    report: [reportSchema] 
});

batchSchema.methods.updateTotalScore = function () {
    this.report.forEach(student => {
        student.totalScore = Object.values(student)
            .filter(val => typeof val === "number" && !isNaN(val) && val !== student.totalScore)
            .reduce((sum, val) => sum + val, 0);
    });
};

batchSchema.pre('save', function (next) {
    this.updateTotalScore();
    next();
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;


// import mongoose, { Types } from 'mongoose';

// const batchSchema = new mongoose.Schema({
//     name: {
//         type: String,
//     },
//     teacher: {
//         type: Types.ObjectId,
//         ref: "Teacher",
//     },
//     students: [
//         {
//             type: Types.ObjectId,
//             ref: "User",
//         }
//     ],
//     labs: [
//         {
//             type: Types.ObjectId,
//             ref: "Lab",
//         }
//     ],
//     report: [
//         { type: Object }
//     ]
// });

// const Batch = mongoose.model('Batch', batchSchema);

// export default Batch;
