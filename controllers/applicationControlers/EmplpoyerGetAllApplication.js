import { catchAsyncErrors } from "../../middlewares/catchAsyncError.js";
import { Application } from "../../models/applicationSchema.js";

export const employerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      success: true,
      applications,
      message: "list of applications",
    });
  }
);
