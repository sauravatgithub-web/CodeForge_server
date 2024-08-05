import Batch from "../models/batchModel.js"

export const getAllBatches = async(req, res) => {
    const batchInfo = await Batch.find();
    const allBatches = batchInfo.map((batch) => batch.name);
    allBatches.sort();
    return res.status(200).json({ success: true, allBatches });
}