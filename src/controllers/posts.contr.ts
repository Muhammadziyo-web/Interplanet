import User from "../schemas/user.schema.js";
import Post from "../schemas/posts.schema.js";
import { Request, Response } from "express";
import { JWT } from "../utils/jwt.js";

export default {
  async post(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const { text, title } = req.body;

      if (!text || !title || !text.trim() || !title.trim()) {
        return res.status(400).json({ message: "Invalid data" });
      }
      // Check if the user exists
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Create a new post
      const newPost: any = new Post({
        text,
        title,
        owner: userId, // Associate the post with the user who created it
      });

      // Save the new post to the database
      await newPost.save();

      // Update the user's posts array with the new post
      user.posts.push(newPost);
      await user.save();

      res
        .status(201)
        .json({ data: newPost, message: "Post created successfully." });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async put(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const { text, title } = req.body;
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      // Find the post by its ID
      const post: any = await Post.findById(postId)
        .populate({
          path: "comments",
          populate: "userId",
        })
        .populate("owner");

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      // Ensure that the user updating the post is the owner (or add additional authorization logic as needed)
      if (post.owner.id.toString() !== userId) {
        return res.status(403).json({
          message: "You are not authorized to update this post.",
        });
      }

      // Update the post's text
      if (text && text.trim()) {
        post.text = text;
      }
      if (title && title.trim()) {
        post.title = title;
      }

      // Save the updated post
      await post.save();

      res
        .status(200)
        .json({ data: post, message: "Post updated successfully." });
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getByToken(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      const userPosts = await Post.find({ owner: userId })
        .populate({
          path: "comments",
          populate: "userId",
        })
        .populate("owner");
      res.status(200).json(userPosts);
    } catch (error) {
      console.error("Error retrieving user posts:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getById(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId)
        .populate({
          path: "comments",
          populate: "userId",
        })
        .populate("owner");

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      res.status(200).json(post);
    } catch (error) {
      console.error("Error retrieving post by ID:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async getAll(req: Request, res: Response) {
    try {
      const allPosts = await Post.find()
        .populate({
          path: "comments",
          populate: "userId",
        })
        .populate("owner");

      res.status(200).json(allPosts);
    } catch (error) {
      console.error("Error retrieving all posts:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  async delete(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const token = req.headers.token as string;
      const userId = JWT.VERIFY(token).id;
      // Find the post by its ID
      const post: any = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      // Ensure that the user deleting the post is the owner (or add additional authorization logic as needed)
      if (post.owner.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this post." });
      }

      // Delete the post
      await Post.findByIdAndDelete(postId);

      res.status(200).json({ message: "Post deleted successfully." });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }, 
  async like(req: Request, res: Response) {
    
    try {
       const postId = req.params.id;
       const token = req.headers.token as string;
       const userId = JWT.VERIFY(token).id;
       const post = await Post.findById(postId);

       if (!post) {
         return res.status(404).json({ message: "Post not found." });
       }

       // Check if the user has already liked the post
       const userHasLiked = post.likes.includes(userId);

       if (userHasLiked) {
         // User has already liked the post, so unlike it
         post.likes = post.likes.filter((id) => id as string != userId);
         
       } else {
         // User hasn't liked the post, so like it
         post.likes.push(userId);
       }

       // Save the updated post
       await post.save();

       const message = userHasLiked
         ? "Post unliked successfully."
         : "Post liked successfully.";
       res.status(200).json({ message });
     } catch (error) {
       console.error("Error liking/unliking post:", error);
       res.status(500).json({ message: "Internal server error." });
     }
   }
};
