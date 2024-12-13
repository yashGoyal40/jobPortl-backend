import { catchAsyncErrors } from "../../middlewares/catchAsyncError.js";
import ErrorHandler from "../../middlewares/error.js";
import { Job } from "../../models/jobSchema.js";

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job not found.", 404));
  }

  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "job deleted",
  });
});