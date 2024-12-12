import express from "express"
import { getUser, login, logout, register, updateProfile } from "../controllers/userContoller.js"
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",isAuthenticated,logout)
router.get("/me",isAuthenticated,getUser)
router.put("/update/profile",isAuthenticated,updateProfile)
export default router