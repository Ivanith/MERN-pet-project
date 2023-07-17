import { json } from "express";
import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
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
      .populate("user")
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
