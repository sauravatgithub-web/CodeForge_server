import express from 'express'
import {
    getAllBatches
} from '../controller/batchController.js'

const router = express.Router();

router.get('/', getAllBatches);

export default router;