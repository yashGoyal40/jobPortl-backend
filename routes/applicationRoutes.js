import express from "express";
import { isAuthenticated, isAutherised } from "../middlewares/auth.js";
import {
  deleteApplication,
  employerGetAllApplication,
  jobSeekerGetAllApplication,
  postApplication,
} from "../controllers/applicationControlers/index.js";

const router = express.Router();

router.post(
  "/apply/:id",
  isAuthenticated,
  isAutherised("Job seeker"),
  postApplication
);

router.get(
  "/employer/getall",
  isAuthenticated,
  isAutherised("Employer"),
  employerGetAllApplication
);

router.get(
  "/jobseeker/getall",
  isAuthenticated,
  isAutherised("Job seeker"),
  jobSeekerGetAllApplication
);

router.delete("/delete/:id", isAuthenticated, deleteApplication);

export default router;
