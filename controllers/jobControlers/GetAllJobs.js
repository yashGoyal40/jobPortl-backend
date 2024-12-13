import { catchAsyncErrors } from "../../middlewares/catchAsyncError.js";
import { Job } from "../../models/jobSchema.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { place, niche, workType, searchKeyword } = req.query;
  const query = {};
  if (workType) {
    query.jobType = { $regex: workType, $options: "i" };
  }
  if (place) {
    query.location = { $regex: place, $options: "i" };
  }
  if (niche) {
    query.jobNiche = { $regex: niche, $options: "i" };
  }
  if (searchKeyword) {
    query.$or = [
      { title: { $regex: searchKeyword, $options: "i" } },
      { companyName: { $regex: searchKeyword, $options: "i" } },
      { introduction: { $regex: searchKeyword, $options: "i" } },
    ];
  }

  const jobs = await Job.find(query);
  res.status(200).json({
    success: true,
    jobs,
    count: jobs.length,
  });
});