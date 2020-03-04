const express = require("express");
const route = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//post create Post methord
route.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// get request to get all post

route.get("/", auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 }); // new first
    res.json(post);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//get post by id
route.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not Found" });
    res.status(500).send("Server Error");
  }
});

// delete post by id
route.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }
    //  check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not autharized" });
    }
    await post.remove();
    res.json({ msg: "Post Removed" });
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "Post not Found" });
    res.status(500).send("Server Error");
  }
});

// Put request to add likes  api/post/like/:id

route.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // post is not already liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already Liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server Error");
  }
});
// remove likes put request
route.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // post is not already liked
    if (
      post.likes.filter(like => like.user.toString() == req.user.id).length < 1
    ) {
      return res.status(400).json({ msg: "Post not liked" });
    }
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server Error");
  }
});

// post api / comment/:id
route.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComments = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      post.comments.unshift(newComments);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);
// delete the comment  /  post id and commet id

route.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment dose not there " });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not autharized" });
    }

    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = route;
