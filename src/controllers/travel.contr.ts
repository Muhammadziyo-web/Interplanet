import User from "../schemas/user.schema.js";
import { ObjectId } from "mongoose";
import Post from "../schemas/posts.schema.js";
import { Request, Response } from "express";
import { JWT } from "../utils/jwt.js";
import Travel from "../schemas/travel.schema.js";
import path from "path";
import uploader from "../utils/cloudinary.js";
import { v4 } from "uuid";

export default {
  async post(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const { from, to, price, startDate, arriveDate } = req.body;
      if (!from || !to || !price || !startDate || !arriveDate) {
        return res.status(400).json({ message: "Invalid data" });
      }
      // Check if the user exists
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      let newTravel: any = new Travel({
        from,
        to,
        price,
        startDate,
        arriveDate,
        owner: userId, // Associate the travel listing with the authenticated user
      });
      await newTravel.save();

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
        let imgPath: any = await uploader(img.data, v4());
        await Travel.findByIdAndUpdate(newTravel._id, { img: imgPath });
      }
      user.travel.push(newTravel._id);
      await user.save();
      let data = await Travel.findById(newTravel._id);
      return res.status(201).json({
        message: "Travel listing created successfully.",
        data,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async put(req: Request, res: Response) {
    try {
      const travelId = req.params.id;
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const travel: any = await Travel.findById(travelId);

      if (!travel) {
        return res.status(404).json({ message: "Post not found." });
      }

      if (travel.owner.toString() != userId) {
        return res.status(403).json({
          message: "You are not authorized to update this travel.",
        });
      }

      await Travel.findByIdAndUpdate(travelId, req.body);
let data = await Travel.findById(travelId);
      res
        .status(200)
        .json({ data, message: "Travel updated successfully." });
    } catch (error) {
      console.error("Error updating travel:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getByToken(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const userTravels = await Travel.find({ owner: userId });
      res.status(200).json(userTravels);
    } catch (error) {
      console.error("Error retrieving user trevel:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getById(req: Request, res: Response) {
    try {
      const travelId = req.params.id;
      const travel = await Travel.findById(travelId).populate("owner");

      if (!travel) {
        return res.status(404).json({ message: "Post not found." });
      }

      res.status(200).json(travel);
    } catch (error) {
      console.error("Error retrieving post by ID:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getAll(req: Request, res: Response) {
    try {
      const allTravels = await Travel.find().populate("owner");
      res.status(200).json(allTravels);
    } catch (error) {
      console.error("Error retrieving all travel:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};
