import Batch from "../models/batchModel.js";
import { ErrorHandler } from '../utils/utility.js';

export const getAllBatches = async(req, res) => {
    const batchInfo = await Batch.find();
    const allBatches = batchInfo.map((batch) => batch.name);
    allBatches.sort();
    return res.status(200).json({ success: true, allBatches });
}

export const getBatch = async(req, res, next) => {
    const name = req.params.name;
    const batch = await Batch.findOne({ name: name });
    if(!batch) return next(new ErrorHandler("Incorrect batch", 404));
    return res.status(200).json({ success: true, batch : batch });
}