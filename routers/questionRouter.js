import express from 'express'
import {
    getAllQuestions,
    getThisQuestion,
    runCode,
    submitCode,
    createQuestion
} from '../controller/questionController.js'

const router = express.Router();

router.get('/getQuestions', getAllQuestions);
router.get('/:id', getThisQuestion);
router.post('/runCode/:id', runCode);
router.post('/submitCode/:id', submitCode);
router.post('/createQuestion',createQuestion);

export default router;