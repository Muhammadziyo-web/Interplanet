var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sha256 from "sha256";
import User from "../schemas/user.schema.js";
import { JWT } from "../utils/jwt.js";
import path from "path";
import uploader from "../utils/cloudinary.js";
export default {
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const existingUser = yield User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        message: "Email already exists. Please log in or use a different email.",
                    });
                }
                const newUser = new User({
                    email,
                    password: sha256(password),
                });
                yield newUser.save();
                res.status(201).json({
                    token: JWT.SIGN({
                        id: newUser._id,
                    }),
                    data: newUser,
                    message: "User registered successfully.",
                });
            }
            catch (error) {
                console.error("Error in user registration:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const user = yield User.findOne({ email })
                    .populate("posts")
                    .populate("jobs")
                    .populate("travel");
                if (!user) {
                    return res
                        .status(404)
                        .json({ message: "User not found. Please register." });
                }
                const passwordMatch = (yield sha256(password)) == user.password;
                if (!passwordMatch) {
                    return res
                        .status(401)
                        .json({ message: "Invalid password. Please try again." });
                }
                res.status(200).json({
                    data: Object.assign(Object.assign({}, user.toObject()), { password: undefined }),
                    token: JWT.SIGN({
                        id: user._id,
                    }),
                });
            }
            catch (error) {
                console.error("Error in user login:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const user = yield User.findById(userId)
                    .populate("posts")
                    .populate("jobs")
                    .populate("travel");
                if (!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                res
                    .status(200)
                    .json({ data: Object.assign(Object.assign({}, user.toObject()), { password: undefined }) });
            }
            catch (error) {
                console.error("Error in retrieving user by token:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token = req.headers.token;
                const id = JWT.VERIFY(token).id;
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
                    let imgPath = yield uploader(img.data, id);
                    yield User.findByIdAndUpdate(id, {
                        img: imgPath,
                    });
                }
                let updateData = req.body;
                const requiredProperties = ["fullName", "bio", "planet"];
                const foundProperty = requiredProperties.find((property) => req.body[property]);
                if ((Object.keys(updateData).length === 0 || !foundProperty) &&
                    !req.files) {
                    return res
                        .status(400)
                        .json({ message: "No data provided for update." });
                }
                const existingData = yield User.findById(id);
                if (!existingData) {
                    return res.status(404).json({ message: "User not found." });
                }
                for (const field in updateData) {
                    if (updateData.hasOwnProperty(field)) {
                        const fieldValue = updateData[field];
                        if (fieldValue && requiredProperties.includes(field)) {
                            existingData[field] = fieldValue;
                        }
                    }
                }
                const updatedData = yield existingData.save();
                res.status(201).json({
                    data: Object.assign(Object.assign({}, updatedData.toObject()), { password: undefined }),
                    message: "User successfully updated.",
                });
            }
            catch (error) {
                console.error("Error updating user information:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
};
