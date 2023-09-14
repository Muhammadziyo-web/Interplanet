var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Job from "../schemas/jobs.schema.js";
import { JWT } from "../utils/jwt.js";
import User from "../schemas/user.schema.js";
export default {
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyName, jobTitle, salary, planet, about } = req.body;
                const token = req.headers.token;
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
                yield newJob.save();
                yield User.findByIdAndUpdate(userId, { $push: { jobs: newJob._id } });
                res.status(201).json({
                    data: newJob,
                    message: "Job listing created successfully.",
                });
            }
            catch (error) {
                console.error("Error creating job listing:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getByToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const data = yield Job.find({ owner: userId });
                res.status(200).json(data);
            }
            catch (error) {
                console.error("Error retrieving user jobs:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobId = req.params.id;
                const job = yield Job.findById(jobId).populate("owner");
                if (!job) {
                    return res.status(404).json({ message: "Job not found." });
                }
                res.status(200).json(job);
            }
            catch (error) {
                console.error("Error retrieving job by ID:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allPosts = yield Job.find().populate("owner");
                res.status(200).json(allPosts);
            }
            catch (error) {
                console.error("Error retrieving all jobs:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobId = req.params.id;
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const job = yield Job.findById(jobId);
                if (!job) {
                    return res.status(404).json({ message: "job not found." });
                }
                if (job.owner.toString() != userId) {
                    return res.status(403).json({
                        message: "You are not authorized to update this job.",
                    });
                }
                yield Job.findByIdAndUpdate(jobId, req.body);
                let data = yield Job.findById(jobId);
                return res.status(201).json({
                    data,
                    message: "User successfully updated.",
                });
            }
            catch (error) {
                console.error("Error updating job:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
};
