import { catchAsyncErrors } from "../../middlewares/catchAsyncError.js";

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: 'None', 
    })
    .json({
      success: true,
      message: "logged out successfully",
    });
});
