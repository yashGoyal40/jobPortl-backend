import express from "express"
import { getUser, login, logout, register, updatePasswrod, updateProfile } from "../controllers/userContoller.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",isAuthenticated,logout)
router.get("/me",isAuthenticated,getUser)
router.put("/update/profile",isAuthenticated,updateProfile)
router.put("/update/password",isAuthenticated,updatePasswrod)
export default router