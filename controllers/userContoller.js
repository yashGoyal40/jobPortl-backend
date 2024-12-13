import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";
import { Job } from "../models/jobSchema.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      role,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
    } = req.body;

    if (!name || !email || !phone || !address || !password || !role) {
      return next(new ErrorHandler("All fields are nequred", 400));
    }
    if (role === "Job seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(
        new ErrorHandler("please provide your preffered niches", 400)
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already registered", 400));
    }

    const otp = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const userData = {
      name,
      email,
      phone,
      address,
      password,
      role,
      coverLetter,
      niches: {
        firstNiche,
        secondNiche,
        thirdNiche,
      },
      otp,
      otpExpires,
    };

    if (req.files && req.files.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_seekers_resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud", 500)
            );
          }

          userData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("failed to upload resume", 500));
        }
      }
    }
    const user = await User.create(userData);

    const emailContent = `Your OTP for verification is ${otp}. It will expire in 10 minutes.`;
    const subject = "Verify Your Email";
    sendEmail({
      email: user.email,
      subject,
      message: emailContent,
    });

    res.status(200).json({
      success: true,
      message: "Registration successful. Verification email sent.",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyUser = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required", 400));
  }

  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.isVerified) {
    return next(new ErrorHandler("User is already verified", 400));
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  sendToken(user, 200, res, "User Registered and verified succesfully");

});



export const login = catchAsyncErrors(async (req, res, next) => {
  const { role, email, password } = req.body;
  if (!role || !email || !password) {
    return next(new ErrorHandler("Email, password and role are required", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or password", 400));
  }

  const isPassworMateched = await user.comparePassword(password);
  if (!isPassworMateched) {
    return next(new ErrorHandler("Invalid Email or Password", 400));
  }
  if (user.role !== role) {
    return next(new ErrorHandler("Invalid user or role", 400));
  }

  sendToken(user, 200, res, "User logged in successfully");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "logged out successfully",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const User = req.user;
  res.status(200).json({
    success: true,
    User,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    role: req.body.role,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
  };
  const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

  if (
    req.user.role === "Job seeker" &&
    (!firstNiche || !secondNiche || !thirdNiche)
  ) {
    return next(new ErrorHandler("please provide your preffered niches", 400));
  }

  if (req.files) {
    const { resume } = req.files;

    if (resume) {
      const currentResumeId = req.user.resume.public_id;
      if (currentResumeId) {
        await cloudinary.uploader.destroy(currentResumeId);
      }

      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "Job_seekers_resume",
      });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
    message: "Profile updated successfully",
  });
});

export const updatePasswrod = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const isPasswordisMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordisMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("confirm Password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password updated successfully");
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  if (user.resume) {
    const resumeID = user.resume.public_id;
    if (resumeID) {
      await cloudinary.uploader.destroy(resumeID);
    }
  }
  if (user.role === "Employer") {
    await Job.deleteMany({ postedBy: user._id });
  }

  await User.findByIdAndDelete(user._id);

  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User Deleted succesfully with all the applications/jobs",
    });
});
