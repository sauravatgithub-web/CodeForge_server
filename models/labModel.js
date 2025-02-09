import mongoose, { Types } from 'mongoose';

const labSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Please give a topic']
    },
    batch: {
        type: String,
        required: [true, "Please enter a batch"]
    },
    date:{
        type : String
    },
    questions: [
        {
            id: {
                type: Types.ObjectId,
                ref: "Question", 
            },
            tag: { type: String},
            numTestCase : { type: Number }
        }
    ],
    report: [
        {
            type: Object
        }
    ],
    totalMarks: {
        type: Number,
        default : function() {
            let marks = 0;
            for(let i = 0; i < this.questions.length; i++) {
                marks += (this.questions[i].tag==="easy") ? 20 : (this.questions[i].tag==="medium") ? 30 : 50; 
            }
            return marks;
        }
    },
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
};

labSchema.methods.extendLab = async function(extendTime){

    // to extend the time of lab after it is started
    if(!this.isStart) throw new ErrorHandler('Lab is not started!');
    this.duration+=extendTime;
    await this.save();
};

const Lab = mongoose.model('Lab', labSchema);

export default Lab;