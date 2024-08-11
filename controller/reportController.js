import User from '../models/userModel.js';
import Lab from '../models/labModel.js';
import Report from '../models/reportModal.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createData = async (labId, userId, questionId, count, script) => {
    const reportName = labId + userId;
    let report = await Report.findOne({ name: reportName });

    if (report) {
        let questionIndex = report.questions.findIndex(q => q.questionId.toString() === questionId);

        if (questionIndex !== -1) {
            report.questions[questionIndex].count = count;
            report.questions[questionIndex].script = script;
        } 
        else {
            report.questions.push({ questionId, count, script });
        }

        await report.save(); 
    } 
    else {
        const user = await User.findById(userId);

        const newReport = new Report({
            name: reportName,
            rollNumber: user.rollNumber,
            studentName: user.name,
            questions: [
                { questionId, count, script }
            ]
        });

        await newReport.save(); 
    }
};

export { createData }