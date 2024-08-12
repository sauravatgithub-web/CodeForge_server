import express from 'express'
import {
    getAllBatches,
    getBatch
} from '../controller/batchController.js'

const router = express.Router();

router.get('/', getAllBatches);
router.get('/:name', getBatch);

export default router;