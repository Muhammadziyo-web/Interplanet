import { Request, Response } from "express";
import Comment from "../schemas/comments.schema.js";
import Post from "../schemas/posts.schema.js";
import { JWT } from "../utils/jwt.js";

export default {
  async post(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const { comment } = req.body;
      const postId = req.params.id;
      // Create a new comment
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }
      const newComment: any = new Comment({
        comment,
        userId, // Associate the comment with the authenticated user
      });
      await newComment.save();
      post.comments.push(newComment._id);
      await post.save();

      // Save the new comment to the database

      res
        .status(201)
        .json({ data: newComment, message: "Comment added successfully." });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async get(req: Request, res: Response) {
      try {
        const commentId = req.params.id;
      // Find the comment by its ID
      const comment = await Comment.findById(commentId).populate("userId");

      if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
      }

      res.status(200).json(comment);
    } catch (error) {
      console.error("Error retrieving comment by ID:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async put(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const commentId = req.params.id;
      const { comment } = req.body;

      // Find the comment by its ID
      const foundComment: any = await Comment.findById(commentId);

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
      await foundComment.save();

      res
        .status(200)
        .json({ data: foundComment, message: "Comment updated successfully." });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async delete(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const commentId = req.params.id;
      // Find the comment by its ID
      const foundComment: any = await Comment.findById(commentId);

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
      await Comment.findByIdAndDelete(foundComment._id);

      res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};
