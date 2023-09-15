var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../schemas/user.schema.js";
import { JWT } from "../utils/jwt.js";
import Travel from "../schemas/travel.schema.js";
import path from "path";
import uploader from "../utils/cloudinary.js";
import { v4 } from "uuid";
export default {
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const { from, to, price, startDate, arriveDate } = req.body;
                if (!from || !to || !price || !startDate || !arriveDate) {
                    return res.status(400).json({ message: "Invalid data" });
                }
                // Check if the user exists
                const user = yield User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                let newTravel = new Travel({
                    from,
                    to,
                    price,
                    startDate,
                    arriveDate,
                    owner: userId, // Associate the travel listing with the authenticated user
                });
                yield newTravel.save();
                let reqFiles = req.files;
                if (req.files && reqFiles) {
                    const img = reqFiles.img;
                    const allowedExtensions = [".jpg", ".jpeg", ".png"];
                    const ext = path.extname(img.name).toLowerCase();
                    if (!allowedExtensions.includes(ext)) {
                        return res
                            .status(400)
                            .json({ message: "Only JPEG and PNG image files are allowed" });
                    }
                    let imgPath = yield uploader(img.data, v4());
                    yield Travel.findByIdAndUpdate(newTravel._id, { img: imgPath });
                }
                user.travel.push(newTravel._id);
                yield user.save();
                let data = yield Travel.findById(newTravel._id);
                return res.status(201).json({
                    message: "Travel listing created successfully.",
                    data,
                });
            }
            catch (error) {
                console.error("Error creating post:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const travelId = req.params.id;
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const travel = yield Travel.findById(travelId);
                if (!travel) {
                    return res.status(404).json({ message: "Post not found." });
                }
                if (travel.owner.toString() != userId) {
                    return res.status(403).json({
                        message: "You are not authorized to update this travel.",
                    });
                }
                yield Travel.findByIdAndUpdate(travelId, req.body);
                let data = yield Travel.findById(travelId);
                res
                    .status(200)
                    .json({ data, message: "Travel updated successfully." });
            }
            catch (error) {
                console.error("Error updating travel:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getByToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const userTravels = yield Travel.find({ owner: userId });
                res.status(200).json(userTravels);
            }
            catch (error) {
                console.error("Error retrieving user trevel:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const travelId = req.params.id;
                const travel = yield Travel.findById(travelId).populate("owner");
                if (!travel) {
                    return res.status(404).json({ message: "Post not found." });
                }
                res.status(200).json(travel);
            }
            catch (error) {
                console.error("Error retrieving post by ID:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allTravels = yield Travel.find().populate("owner");
                res.status(200).json(allTravels);
            }
            catch (error) {
                console.error("Error retrieving all travel:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
};
