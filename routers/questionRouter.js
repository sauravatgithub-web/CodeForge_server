import express from 'express'
import {
    getAllQuestions,
    getThisQuestion,
    getTeacherQuestions,
    runCode,
    submitCode,
    createQuestion,
    updateQuestion
} from '../controller/questionController.js'

const router = express.Router();

router.get('/getQuestions', getAllQuestions);
router.get('/:id', getThisQuestion);
router.get('/getQuestions/:id', getTeacherQuestions); // get questions posted by teacher with id
router.post('/runCode/:id', runCode);
router.post('/submitCode/:id', submitCode);
router.post('/createQuestion',createQuestion);
router.post('/updateQuestion', updateQuestion);

export default router;