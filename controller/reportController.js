import User from '../models/userModel.js';
import Lab from '../models/labModel.js';
import Report from '../models/reportModal.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

const createData = async (lab, rollNumber, questionId, count, script) => {
    const report = lab.report;
    const studentReport = report.find((student) => student.rollNumber === rollNumber);
    const index = lab.questions.indexOf(questionId);

    studentReport[`question${index+1}`] = count;
    studentReport[`code${index+1}`] = script;

    await lab.save();
};

export { createData }