import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { CustomError } from "../utils/customError.js";
import sendResponse from "../utils/sendResponse.js";
import JwtService from "../utils/jwtService.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new CustomError("Email already exists", 400));

    const encryptedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    const token = JwtService.sign({ userId: newUser._id.toString() }); // pass payload as an object

    sendResponse(res, 200, {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return next(new CustomError(error.message, 500));
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new CustomError("User not found", 404));

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return next(new CustomError("Invalid credentials", 400));

    const token = await JwtService.sign(user._id.toString());

    sendResponse(res, 200, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};


export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find({ _id: { $ne: req.user } });
    sendResponse(res, 200, users);
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new CustomError("User not found", 404));
    sendResponse(res, 200, user);
  } catch (error: any) {
    return next(new CustomError(error.message, 500));
  }
};
