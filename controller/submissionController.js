import Submission from '../models/submissionModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const getAllSubmission = tryCatch(async(req, res) => {
    const allSubmission = await Submission.find();
    return res.status(200).json({ success: true, submission: allSubmission });
});

const getThisSubmission = tryCatch(async(req, res, next) => {
    const name = req.params.name;
    const submission = await Submission.find({name});
    if(!submission) return next(new ErrorHandler("Incorrect name", 404));
    return res.status(200).json({ success: true, submission: submission });
});

const createSubmission = tryCatch(async({name, time, space, script})=>{
    const submission = {
        name, time, space, script
    }
    await Submission.create(submission);
})


export { getAllSubmission, getThisSubmission, createSubmission }