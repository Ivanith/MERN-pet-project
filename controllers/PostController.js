import { json, query } from "express";
import mongoose from "mongoose";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

export const getAll = async (req, res) => {
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const default_lim = 10;
  const date = req.query.date;
  const views = req.query.views;
  const likes = req.query.likes;

  try {
    const sortOptions = {};

    if (date) {
      sortOptions.createdAt = date;
    } else if (views) {
      sortOptions.viewsCount = views;
    } else if (likes) {
      sortOptions.likes = likes;
    }

    const posts = await PostModel.find()
      .skip(skip)
      .limit(default_lim)
      .sort(sortOptions)
      .populate({
        path: "user",
        select: "-email -passwordHash -likedPosts", //exclude user data
      })
      .exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "posts recieve error",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      }
    )
      .populate({
        path: "user",
        select: "-email -passwordHash -likedPosts", //exclude user data
      })
      .then((doc) => {
        if (!doc) {
          return Promise.reject({
            status: 404,
            message: "post not found error",
          });
        }

        return res.json(doc);
      })
      .then(null, (err) => {
        console.log(err);
        if (err.status && err.message) {
          return res.status(err.status).json({
            message: err.message,
          });
        }
        return res.status(500).json({
          message: "post return error",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "posts recieve error",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await PostModel.findById(postId);
    console.log(postId);
    if (userId !== post.user.toString()) {
      return res.status(200).json("permission denied");
    }
    PostModel.findOneAndDelete({
      _id: postId,
    })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: "post not found error",
          });
        }
        return res.json({
          success: true,
        });
      })

      .then(null, (err) => {
        console.log(err);
        if (err.status && err.message) {
          return res.status(err.status).json({
            message: err.message,
          });
        }
        return res.status(500).json({
          message: "post delete error",
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "post recieve error",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "post creation error",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await PostModel.findById(postId);
    if (userId !== post.user.toString()) {
      return res.status(403).json("permission denied");
    }

    await post.updateOne({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      user: req.userId,
      tags: req.body.tags,
    });
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "post refresh error",
    });
  }
};

export const likePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.userId;

  try {
    const user = await UserModel.findById(userId);
    if (user.likedPosts.includes(postId)) {
      return res
        .status(200)
        .json({ message: "Post already liked by the user" });
    }
    user.likedPosts.push(postId);
    await user.save();

    const post = await PostModel.findById(postId);
    post.likes++;
    await post.save();

    res.status(200).json({ message: "post liked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to like post", error });
  }
};

export const unlikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.userId;

  try {
    const user = await UserModel.findById(userId);
    if (!user.likedPosts.includes(postId)) {
      return res.status(400).json({ message: "post not liked by the user" });
    }

    const postObjectId = new mongoose.Types.ObjectId(postId);
    user.likedPosts = user.likedPosts.filter((id) => !id.equals(postObjectId));
    await user.save();

    const post = await PostModel.findById(postId);
    post.likes--;
    await post.save();

    return res.status(200).json({ message: "post unliked successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to unlike post", error });
  }
};
