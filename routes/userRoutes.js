import express from "express";
import {
  deleteUser,
  getUser,
  login,
  logout,
  register,
  updatePasswrod,
  updateProfile,
} from "../controllers/userContoller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getUser", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePasswrod);
router.delete("/delete", isAuthenticated, deleteUser);
export default router;
