import User from '../models/userModel.js';
import Question from '../models/questionModel.js';
import Lab from '../models/labModel.js';
import Report from '../models/reportModal.js';
import { createSubmission } from '../controller/submissionController.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { createData } from './reportController.js'

dotenv.config();

const getAllLabs = tryCatch(async(req, res) => {
    const allLabs = await Lab.find();
    return res.status(200).json({ success: true, lab: allLabs });
});

const getThisLab = tryCatch(async(req, res, next) => {
    const batch = req.params.batch;
    const lab = await Lab.find({batch});
    if(!lab) return next(new ErrorHandler("Incorrect batch", 404));
    return res.status(200).json({ success: true, lab:lab });
});

const createLab = tryCatch(async(req, res, next) => {
    const { topic, batch, duration, date } = req.body;
    if(!topic || !batch || !duration) return next(new ErrorHandler("Insufficient fileds", 404));
    const newLab = {
        topic, batch, duration, date
    }
    const lab = await Lab.create(newLab);
    return res.status(200).json({ success: true, lab: lab });
});

const updateLab = tryCatch(async(req, res, next) => {
    const { labId, questionArray } = req.body;
    if(!labId || !questionArray) return next(new ErrorHandler("Insufficient fields", 404));

    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Incorrect labId", 404));

    lab.questions = questionArray;
    await lab.save();

    res.status(200).json({ success: true, lab: lab });
});

const startLab = tryCatch(async (req, res, next) => {
    const { labId } = req.params;
    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Incorrect labId",404));
    
    await lab.startLab();
    res.status(200).json({success: true, message : 'Lab started successfully'});
});

const extendLab = tryCatch(async(req,res) => {
    const { labId } = req.params;
    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Incorrect labId",404));
    console.log(req.body.extendTime , labId);
    const extendTime  = req.body.extendTime;
    
    await lab.extendLab(extendTime);
    res.status(200).json({success: true, message : 'Lab extended successfully'});
});

const labQuestionSubmission = tryCatch(async(req, res, next) => {
    const { labId, userId, script, language, versionIndex } = req.body;
    const questionId = req.params.id;
    if(!labId || !userId || !questionId || !script || !language || !versionIndex) 
        return next(new ErrorHandler("Please fill all fields", 404));
  
    const user = await User.findById(userId);
    if(!user) return next(new ErrorHandler("Invalid id", 404));

    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Invalid id", 404));
  
    const question = await Question.findById(questionId);
    if(!question) return next(new ErrorHandler("Invalid id", 404));
  
    const stdin = question.testCase.reduce((final, val) => final + val + " ", question.testCase.length + " ");
    let stdout = question.answer.reduce((final, val) => final + val + "\n", "");
  
    const reqData = {
        clientId : process.env.ADMIN_ID,
        clientSecret : process.env.ADMIN_SECRET,
        script : script,
        stdin : stdin,
        language : language,
        versionIndex : versionIndex,
        compileOnly : false
    }
    const response = await axios.post("https://api.jdoodle.com/v1/execute", reqData, {
        headers: {
            "Content-Type": "application/json",
        },
    })
  
    if(response.status !== 200) return next(new ErrorHandler(`${response.statusText}`, response.status));
  
    const data = response.data;
    data.output = data.output + "\n";
    let success = false;
    let message = "";
    let count = 0;
  
    if(data.output === stdout) {
        if(data.cpuTime >= question.time) {
            return res.status(data.statusCode).json({ success: false, message: "Time Limit Exceeded" });
        }
        if(data.memory >= question.space) {
            return res.status(data.statusCode).json({ succes: false, message: "Memory Limit Exceeded" });
        }
        
        // to save solved question in user
        if(!user.questionsSolved.includes(question._id)) {
            user.questionsSolved.push(question._id);
            await user.save();
        }

        // to create Submission
        const submissionData = {
            name : questionId+userId,
            time : data.cpuTime,
            space: data.memory,
            script
        }
        await createSubmission(submissionData);

        const outputArray = data.output.split('\n');
        outputArray.pop();
        count = outputArray.length;
        success = true;
        message = "All testcases passed successfully";
    }
    else {
        const stdoutArray = stdout.split('\n');
        const outputArray = data.output.split('\n');
        stdoutArray.pop();
        outputArray.pop();
        
        let size = stdoutArray.length;
        for(let i = 0; i < size; i++) {
            if(stdoutArray[i] == outputArray[i]) count++;
        }
        message = `${count}/${size} testcases passed successfully`;
    }

    await createData(labId, userId, questionId, count, script);

    return res.status(200).json({ success, message });
})  

const createReport = tryCatch(async( req, res, next ) => {
    const labId = req.params.id;
    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Invalid id", 404));

    const reports = await Report.find({ name: { $regex : "^" + labId } });
    if(!reports) return next(new ErrorHandler("Invalid id", 404));

    const response = reports.map(report => {
        let formattedReport = {
            rollNumber: report.rollNumber,
            name: report.studentName,
        };

        report.questions.forEach((question, index) => {
            formattedReport[`question${index + 1}`] = question.count;
            formattedReport[`code${index + 1}`] = question.script;
        });
        
        return formattedReport;
    });

    lab.report = response;
    await lab.save();
    res.status(200).json({ success: true, message: "Lab Report created successfully." });
});


export { 
    getAllLabs, 
    getThisLab, 
    createLab, 
    updateLab, 
    startLab, 
    extendLab, 
    labQuestionSubmission,
    createReport
}