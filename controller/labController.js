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
    console.log(lab);
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


export { getAllLabs, getThisLab, createLab, updateLab, startLab, extendLab}