import User from '../models/userModel.js';
import Question from '../models/questionModel.js'
import {createSubmission} from '../controller/submissionController.js'
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const getAllQuestions = tryCatch(async(req, res) => {
    const allQuestions = await Question.find();
    return res.status(200).json({ success: true, questions: allQuestions });
});

const getThisQuestion = tryCatch(async(req, res, next) => {
    const id = req.params.id;
    const question = await Question.findById(id);
    if(!question) return next(new ErrorHandler("Incorrect id", 404));
    return res.status(200).json({ success: true, question: question });
});

const createQuestion = tryCatch(async(req,res,next)=>{
    const {title, description, tags, testCase, answer, hints, constraints, time, space} = req.body;
    if(!title || !description || !tags || !testCase || !answer || !hints || !constraints || !time || !space) 
        return next(new ErrorHandler("Insufficient input",404));

    const reqData = {
        title,
        description,
        tags,
        testCase,
        answer,
        hints,
        constraints,
        time,
        space
    }
    const newQuestion = await Question.create(reqData);
    return res.status(201).json({ sucess: true, data: newQuestion });
})

const runCode = tryCatch(async(req, res, next) => {
    const { script, stdin, language, versionIndex } = req.body;
    if(!script || !stdin || !language || !versionIndex) 
        return next(new ErrorHandler("Insufficient input", 404));

    const reqData = {
        clientId : process.env.ADMIN_ID,
        clientSecret : process.env.ADMIN_SECRET,
        script : script,
        stdin : stdin,
        language : language,
        versionIndex : versionIndex,
        compileOnly : false
    }
    // console.log(reqData);
    const response = await axios.post("https://api.jdoodle.com/v1/execute", reqData, {
        headers: {
            "Content-type": "application/json",
        },
    })
    if(response.status !== 200) return next(new ErrorHandler(`${response.statusText}`, response.status));

    const data = response.data;
    return res.status(200).json({ success: true, data: data });
})

const submitCode = tryCatch(async(req, res, next) => {
    const { userId, script, language, versionIndex } = req.body;
    const questionId = req.params.id;
    if(!userId || !questionId || !script || !language || !versionIndex) 
        return next(new ErrorHandler("Please fill all fields", 404));
  
    const user = await User.findById(userId);
    if(!user) return next(new ErrorHandler("Invalid id", 404));
  
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
  
    if(data.output === stdout) {
        if(data.cpuTime >= question.time) {
            return res.status(data.statusCode).json({ success: false, message: "Time Limit Exceeded" });
        }
        if(data.memory >= question.space) {
            return res.status(data.statusCode).json({ succes: false, message: "Memory Limit Exceeded" });
        }
        
        // to save solved question in user
        user.questionsSolved.push(question._id);
        await user.save();

        // to create Submission
        const submissionData = {
            name : questionId+userId,
            time :data.cpuTime,
            space:data.memory,
            script
        }
        await createSubmission(submissionData);

        return res.status(200).json({ success: true, message: "All testcases passed successfully" });
    }
    else {
        const output = {
            userOutput: data.output,
            actualOutput: stdout
        }
        return res.status(200).json({ sucess: false, output })
    }
})

export { getAllQuestions, getThisQuestion, runCode, submitCode, createQuestion }