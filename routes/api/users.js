const express = require("express");
const route = express.Router();
const gravitar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
//route.get("/", (req, res) => res.send("user"));

const User = require("../../models/User");

route.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { name, email, password } = req.body;
    console.log(name);

    try {
      let user = await User.findOne({ email });
      //console.log(user);
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exist" }] });
      }
      // avatar :
      const avatar = gravitar.url(
        req.body.email,
        {
          s: "200",
          r: "pg",
          d: "mm"
        },
        true
      );
      user = new User({
        name,
        email,
        avatar,
        password
      });
      //  encrpytion
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const paylod = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        paylod,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      ); // for production 3600
      //res.send("User Registered");
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = route;
