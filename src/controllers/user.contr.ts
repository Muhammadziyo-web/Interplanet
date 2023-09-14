import { Request, Response } from "express";
import sha256 from "sha256";
import { login } from "telegraf/typings/button.js";
import User from "../schemas/user.schema.js";
import { JWT } from "../utils/jwt.js";
import path from "path";
import uploader from "../utils/cloudinary.js";
export default {
  async post(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message:
            "Email already exists. Please log in or use a different email.",
        });
      }

      const newUser = new User({
        email,
        password: sha256(password),
      });

      await newUser.save();

      res.status(201).json({
        token: JWT.SIGN({
          id: newUser._id,
        }),
        data: newUser,
        message: "User registered successfully.",
      });
    } catch (error) {
      console.error("Error in user registration:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email })
        .populate("posts")
        .populate("jobs")
        .populate("travel");

      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found. Please register." });
      }

      const passwordMatch = (await sha256(password)) == user.password;

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Invalid password. Please try again." });
      }

      res.status(200).json({
        data: { ...user.toObject(), password: undefined },
        token: JWT.SIGN({
          id: user._id,
        }),
      });
    } catch (error) {
      console.error("Error in user login:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async get(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const user: any = await User.findById(userId)
        .populate("posts")
        .populate("jobs")
        .populate("travel");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      res
        .status(200)
        .json({ data: { ...user.toObject(), password: undefined } });
    } catch (error: any) {
      console.error("Error in retrieving user by token:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async put(req: Request, res: Response) {
    try {
      let token = req.headers.token as string;
      const id = JWT.VERIFY(token).id;
      let reqFiles = req.files as any;
      if (req.files && reqFiles) {
        const img: any = reqFiles.img;

        const allowedExtensions = [".jpg", ".jpeg", ".png"];

        const ext = path.extname(img.name).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
          return res
            .status(400)
            .json({ message: "Only JPEG and PNG image files are allowed" });
        }
        let imgPath = await uploader(img.data, id);

        await User.findByIdAndUpdate(id, {
          img: imgPath,
        });
      }
      let updateData = req.body;
      const requiredProperties = ["fullName", "bio", "planet"];
      const foundProperty = requiredProperties.find(
        (property) => req.body[property]
      );
      if (
        (Object.keys(updateData).length === 0 || !foundProperty) &&
        !req.files
      ) {
        return res
          .status(400)
          .json({ message: "No data provided for update." });
      }
      const existingData: any = await User.findById(id);

      if (!existingData) {
        return res.status(404).json({ message: "User not found." });
      }
      for (const field in updateData) {
        if (updateData.hasOwnProperty(field)) {
          const fieldValue = updateData[field as keyof typeof updateData];

          if (fieldValue && requiredProperties.includes(field)) {
            existingData[field] = fieldValue;
          }
        }
      }
      const updatedData = await existingData.save();

      res.status(201).json({
        data: { ...updatedData.toObject(), password: undefined },
        message: "User successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating user information:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};
