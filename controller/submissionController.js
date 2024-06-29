import Submission from '../models/submissionModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllSubmission = tryCatch(async(req, res) => {
    const allSubmission = await Submission.find();
    return res.status(200).json({ success: true, submission: allSubmission });
});

const getThisSubmission = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const submission = await Submission.find({name}).toArray();
    if(!submission) return next(new ErrorHandler("Incorrect name", 404));
    return res.status(200).json({ success: true, submission:submission });
});

const createSubmission = tryCatch(async(req,res,next)=>{
    const {name,submission} = req.body;
    if(!name || !submission ) return next(new ErrorHandler("Insufficient input",404));

    const reqData = {
        name,
        submission
    }

    const newSubmission = await Submission.create(reqData);
    return res.status(201).json({ sucess: true, data: newSubmission });
})


export { getAllSubmission, getThisSubmission, createSubmission }