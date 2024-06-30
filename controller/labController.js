import Lab from '../models/labModel.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utility.js';

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

const createLab = tryCatch(async({topic,batch,duration})=>{
    const newLab = {
        topic,batch,duration
    }
    await Lab.create(newLab);
})


export { getAllLabs, getThisLab, createLab }