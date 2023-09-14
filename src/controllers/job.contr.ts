import { Request, Response } from "express";
import Job from "../schemas/jobs.schema.js";
import { JWT } from "../utils/jwt.js";
import User from "../schemas/user.schema.js";
export default {
  async post(req: Request, res: Response) {
    try {
      const { companyName, jobTitle, salary, planet, about } = req.body;
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      if (!companyName || !jobTitle || !salary || !planet) {
        return res.status(400).json({ message: "Invalid data." });
      }
      // Create a new job listing
      const newJob = new Job({
        companyName,
        jobTitle,
        salary,
        planet,
        about,
        owner: userId,
      });

      // Save the new job listing to the database
      await newJob.save();
      await User.findByIdAndUpdate(userId, { $push: { jobs: newJob._id } });
      res.status(201).json({
        data: newJob,
        message: "Job listing created successfully.",
      });
    } catch (error) {
      console.error("Error creating job listing:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getByToken(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const data = await Job.find({ owner: userId });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error retrieving user jobs:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getById(req: Request, res: Response) {
    try {
      const jobId = req.params.id;
      const job = await Job.findById(jobId).populate("owner");

      if (!job) {
        return res.status(404).json({ message: "Job not found." });
      }

      res.status(200).json(job);
    } catch (error) {
      console.error("Error retrieving job by ID:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getAll(req: Request, res: Response) {
    try {
      const allPosts = await Job.find().populate("owner");

      res.status(200).json(allPosts);
    } catch (error) {
      console.error("Error retrieving all jobs:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async put(req: Request, res: Response) {
    try {
      const jobId = req.params.id;
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const job: any = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "job not found." });
      }
      if (job.owner.toString() != userId) {
        return res.status(403).json({
          message: "You are not authorized to update this job.",
        });
      }
        await Job.findByIdAndUpdate(jobId, req.body);
        let data = await Job.findById(jobId)
      return res.status(201).json({
        data,
        message: "User successfully updated.",
      });
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};
