import User from '../models/userModel.js';
import Question from '../models/questionModel.js';
import Lab from '../models/labModel.js';
import Report from '../models/reportModal.js';
import { createSubmission } from '../controller/submissionController.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import axios from 'axios';
import dotenv from 'dotenv';
import Batch from '../models/batchModel.js';

dotenv.config();

const getAllLabs = tryCatch(async(req, res) => {
    const allLabs = await Lab.find();
    return res.status(200).json({ success: true, lab: allLabs });
});

const getThisLab = tryCatch(async(req, res, next) => {
    const batch = req.params.batch;
    const lab = await Lab.find({batch});
    if(!lab) return next(new ErrorHandler("Incorrect batch", 404));
    return res.status(200).json({ success: true, lab: lab });
});

const createLab = tryCatch(async (req, res, next) => {
    const { topic, batch, duration, date } = req.body;
    if (!topic || !batch || !duration) return next(new ErrorHandler("Insufficient fields", 404));

    const batchInfo = await Batch.findOne({ name: batch });
    if (!batchInfo || batchInfo.students.length === 0) {
      return next(new ErrorHandler("Batch not found or has no students", 404));
    }   

    const reportPromises = batchInfo.students.map(async (id) => {
      const user = await User.findById(id);
      console.log(id);
      console.log(user);
      return {
        rollNumber: user.rollNumber,
        name: user.name,
        score: 0
      };
    });
    const report = await Promise.all(reportPromises);
  
    const newLab = {
      topic,
      batch,
      duration,
      date,
      report
    };
  
    const lab = await Lab.create(newLab);

    batchInfo.labs.push(lab._id);
    let numLabs = batchInfo.labs.length;

    batchInfo.report = batchInfo.report.map(student => {
        student[`lab${numLabs}`] = 0;
        return student;
    });

    batchInfo.markModified('report');
    await batchInfo.save();

    return res.status(200).json({ success: true, lab });
});
 

const updateLab = tryCatch(async (req, res, next) => {
    const { labId, questionArray } = req.body;
    if (!labId || !questionArray) return next(new ErrorHandler("Insufficient fields", 404));

    const lab = await Lab.findById(labId);
    if (!lab) return next(new ErrorHandler("Incorrect labId", 404));

    lab.questions = questionArray;
    const qlength = questionArray.length;

    const bulkOps = lab.report.map((report, index) => {
        const updateFields = {};
        for (let j = 1; j <= qlength; j++) {
            updateFields[`report.$[elem].question${j}`] = 0;
            updateFields[`report.$[elem].code${j}`] = "";
        }
        return {
            updateOne: {
                filter: { _id: labId, 'report._id': report._id },
                update: { $set: updateFields },
                arrayFilters: [{ 'elem._id': report._id }]
            }
        };
    });

    if (bulkOps.length > 0) {
        await Lab.bulkWrite(bulkOps);
    }

    await lab.save();
    res.status(200).json({ success: true, lab });
});

const updateLabScore = tryCatch(async(req, res, next) => {
    const { labId, scores } = req.body;
    const lab = await Lab.findById(labId);
    if(!lab) return next(new ErrorHandler("Incorrect lab id..", 404));

    // console.log(scores);

    lab.report.forEach((reportItem, index) => {
        reportItem.score = scores[index];
    });
    // console.log(lab.report);

    lab.markModified('report');
    await lab.save();

    const batch = await Batch.findOne({ name: lab.batch });
    if(!batch) return next(new ErrorHandler("Not linked to any batch", 404));

    const index = batch.labs.indexOf(labId);
    console.log(index);
    for(let i = 0; i < lab.report.length; i++) {
        const prevScore = batch.report[i][`lab${index+1}`];
        batch.report[i][`lab${index+1}`] = lab.report[i].score;

        batch.report[i].totalScore += (batch.report[i][`lab${index+1}`] - prevScore);

        console.log(prevScore , batch.report[i][`lab${index+1}`],batch.report[i].totalScore);
        // batch.report[i].totalScore = 0 ;
    }
    
    batch.markModified('report');
    await batch.save();

    return res.status(200).json({ success: true, message: "All updates done successfully." });
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

    await createData(lab, user.rollNumber, questionId, count, script);

    return res.status(200).json({ success, message });
})  

const createData = async (lab, rollNumber, questionId, count, script) => {
    const report = lab.report;
    const studentReport = report.find((student) => student.rollNumber === rollNumber);
    let index = -1;

    for(let i = 0; i < lab.questions.length; i++) {
        if(lab.questions[i].id == questionId) {
            index = i;
            break;
        }
    }
    studentReport[`question${index+1}`] = count;
    studentReport[`code${index+1}`] = script;

    let finalScore =0;
    for(let i=0;i<lab.questions.length;i++){
        finalScore  = finalScore + studentReport[`question${i+1}`];
    }
    console.log(finalScore);
    // studentReport.score -= studentReport[`question${index+1}`];
    studentReport.score = finalScore ;

    lab.markModified('report');
    await lab.save();
};

export { 
    getAllLabs, 
    getThisLab, 
    createLab, 
    updateLab, 
    updateLabScore,
    startLab, 
    extendLab, 
    labQuestionSubmission,
}