import express, { json } from "express";

import multer from "multer";

import cors from "cors";

import mongoose from "mongoose";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations.js";

import { handleValidationErrors, checkAuth } from "./utils/index.js";

import { UserController, PostController } from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:qwerty123@cluster0.hsgvn1r.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err));

const app = express();

// multer part
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

//default
app.use(express.json());

app.use(cors());

// Api for users

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

app.get("/auth/me", checkAuth, UserController.getMe);

app.patch("/auth/me", checkAuth, UserController.updateMe);

app.get("/auth/users", checkAuth, UserController.getUsers);

app.get("/auth/user/:id", checkAuth, UserController.getOneUser);

app.get("/auth/users/search/:name", checkAuth, UserController.searchUserByName);

//multer route

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: "/uploads/${req.file.originalname}",
  });
});

// Api for posts

app.get("/posts", PostController.getAll);

app.get("/posts/:id", PostController.getOne);

app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

app.delete("/posts/:id", checkAuth, PostController.remove);

app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);
app.post("/posts/like/:id", checkAuth, PostController.likePost);

app.delete("/posts/like/:id", checkAuth, PostController.unlikePost);

app.get("/posts/search/:title", checkAuth, PostController.searchPostByName);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server Ok");
});
