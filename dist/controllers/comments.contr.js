var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Comment from "../schemas/comments.schema.js";
import Post from "../schemas/posts.schema.js";
import { JWT } from "../utils/jwt.js";
export default {
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const { comment } = req.body;
                const postId = req.params.id;
                // Create a new comment
                const post = yield Post.findById(postId);
                if (!post) {
                    return res.status(404).json({ message: "Post not found." });
                }
                const newComment = new Comment({
                    comment,
                    userId, // Associate the comment with the authenticated user
                });
                yield newComment.save();
                post.comments.push(newComment._id);
                yield post.save();
                // Save the new comment to the database
                res
                    .status(201)
                    .json({ data: newComment, message: "Comment added successfully." });
            }
            catch (error) {
                console.error("Error adding comment:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commentId = req.params.id;
                // Find the comment by its ID
                const comment = yield Comment.findById(commentId);
                if (!comment) {
                    return res.status(404).json({ message: "Comment not found." });
                }
                res.status(200).json(comment);
            }
            catch (error) {
                console.error("Error retrieving comment by ID:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const commentId = req.params.id;
                const { comment } = req.body;
                // Find the comment by its ID
                const foundComment = yield Comment.findById(commentId);
                if (!foundComment) {
                    return res.status(404).json({ message: "Comment not found." });
                }
                // Ensure that the user updating the comment is the owner (or add additional authorization logic as needed)
                if (foundComment.userId.toString() !== userId) {
                    return res.status(403).json({
                        message: "You are not authorized to update this comment.",
                    });
                }
                if (!comment.trim()) {
                    return res.status(400).json({
                        message: "Invalid data",
                    });
                }
                // Update the comment's content
                foundComment.comment = comment;
                // Save the updated comment
                yield foundComment.save();
                res
                    .status(200)
                    .json({ data: foundComment, message: "Comment updated successfully." });
            }
            catch (error) {
                console.error("Error updating comment:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.headers.token;
                const userId = JWT.VERIFY(token).id;
                const commentId = req.params.id;
                // Find the comment by its ID
                const foundComment = yield Comment.findById(commentId);
                if (!foundComment) {
                    return res.status(404).json({ message: "Comment not found." });
                }
                // Ensure that the user deleting the comment is the owner (or add additional authorization logic as needed)
                if (foundComment.userId.toString() !== userId) {
                    return res
                        .status(403)
                        .json({ message: "You are not authorized to delete this comment." });
                }
                // Delete the comment
                yield Comment.findByIdAndDelete(foundComment._id);
                res.status(200).json({ message: "Comment deleted successfully." });
            }
            catch (error) {
                console.error("Error deleting comment:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
    },
};
