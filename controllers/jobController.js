import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";

export const postjob = catchAsyncErrors(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorHandler("please provide full job details", 400));
  }
  const {
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsiteUrl,
    personalWebsiteTitle,
    jobNiche,
    newsLettersSent,
  } = req.body;

  if (
    !title ||
    !jobType ||
    !location ||
    !companyName ||
    !responsibilities ||
    !qualifications ||
    !salary ||
    !jobNiche
  ) {
    return next(new ErrorHandler("Please provide full job details", 400));
  }

  if (
    (personalWebsiteTitle && !personalWebsiteUrl) ||
    (personalWebsiteUrl && !personalWebsiteTitle)
  ) {
    return next(
      new ErrorHandler(
        "either Provide both website url and title or leave both blank",
        400
      )
    );
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsite: {
      title: personalWebsiteUrl,
      url: personalWebsiteTitle,
    },
    jobNiche,
    newsLettersSent,
    postedBy,
  });

  res.status(200).json({
    success: true,
    message: "Job Posted Successfully",
    job,
  });
});

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

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
    count: myJobs.length,
  });
});

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

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! job not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "job found",
    job
  });
});
