import mongoose, { Types } from 'mongoose';
import {sendReport} from '../controller/reportController.js';

const labSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Please give a topic']
    },
    batch: {
        type: String,
        required: [true, "Please enter a batch"]
    },
    questions: [
        {
            type: Types.ObjectId,
            ref: "Question",
        }
    ],
    report: [
        {
            type: Object
        }
    ],
    duration: {
        type : Number,
        required: [true,"Please enter the duration"]
    },
    isStart :{
        type: Boolean,
        default: false
    },
    isEnd :{
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

labSchema.methods.startLab = async function() {
    if (this.isStart) {
        throw new ErrorHandler('Lab is already started');
    }

    this.isStart = true;
    await this.save();

    // Start the countdown
    const interval = async () => {
        if (this.duration > 0) {
            this.duration -= 1;
            await this.save();
        } else {
            this.isEnd = true;
            this.isStart = false;
            await this.save();
            clearInterval(interval);
        }
    };

    setInterval(interval,1000);
    await sendReport(this.ObjectId);
};

labSchema.methods.extendLab = async function(extendTime){
    if(!this.isStart) throw new ErrorHandler('Lab is not started!');
    this.duration+=extendTime;
    await this.save();
};

const Lab = mongoose.model('Lab', labSchema);

export default Lab;