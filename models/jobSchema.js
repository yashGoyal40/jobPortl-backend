import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ["Full-time", "Part-time"],
    },
    location: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    introduction: {
      type: String,
    },
    responsibilities: {
      type: [String],
      required: true,
      validate: [
        (array) => array.length > 0,
        "At least one responsibility is required",
      ],
    },
    qualifications: {
      type: [String],
      required: true,
      validate: [
        (array) => array.length > 0,
        "At least one responsibility is required",
      ],
    },
    offers: {
      type: [String],
    },
    salary: {
      type: String,
      required: true,
    },
    hiringMultipleCandidates: {
      type: String,
      default: "No",
      enum: ["yes", "No"],
    },
    personalWebsite: {
      title: String,
      url: String,
    },
    jobNiche: {
      type: String,
      required: true,
    },
    newsLettersSent: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
