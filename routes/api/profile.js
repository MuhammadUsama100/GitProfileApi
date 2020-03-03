const express = require("express");
const route = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const request = require("request");
const config = require("config");
// route Get api/profile/me

route.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avater"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// post request create and update user profile
route.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      gitHubUsername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;
    //  build profile object
    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (location) profileFeilds.location = location;
    if (bio) profileFeilds.bio = bio;
    if (status) profileFeilds.status = status;
    if (gitHubUsername) profileFeilds.gitHubUsername = gitHubUsername;
    if (skills) {
      profileFeilds.skills = skills.split(",").map(skill => skill.trim());
    }
    // build social object
    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (linkedin) profileFeilds.social.linkedin = linkedin;
    if (instagram) profileFeilds.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).send("server Error");
    }

    console.log(profileFeilds.skills);
    res.send("hello");
  }
);

//  get all profiles public
route.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server Error");
  }
});

// get profile by id

//  get all profiles public
route.get("/user/:user_id", async (req, res) => {
  try {
    console.log(req.params.user_id);
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile Not Found" });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.status(500).send("server Error");
  }
});

//  delete Profile
// private
route.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    // user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json("user Deleted");
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.status(500).send("server Error");
  }
});

// put request /  for array inside the collection profile/experience

route.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is requiered")
        .not()
        .isEmpty(),
      check("company", "company is requiered")
        .not()
        .isEmpty(),
      check("from", "from date is requiered")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty())
      return res.status(400).json({ errors: error.array() });
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server Error");
    }
  }
);
// delete experience api/profile/experience/:exp_id

route.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeExp = profile.experience
      .map(item => item.id)
      .indexOf(req.param.exp_id);
    profile.experience.splice(removeExp, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// Add profile eduction

route.put(
  "/education",
  [
    auth,
    [
      check("school", "School is requiered")
        .not()
        .isEmpty(),
      check("degree", "Degree is requiered")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Feild Of Study is requiered")
        .not()
        .isEmpty(),
      check("from", "date is requiered")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty())
      return res.status(400).json({ errors: error.array() });
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server Error");
    }
  }
);

route.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeEdu = profile.education
      .map(item => item.id)
      .indexOf(req.param.edu_id);
    profile.education.splice(removeEdu, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

// git hub

route.get("/github/:username", (req, res) => {
  try {
    const option = {
      uri: `http://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,

      method: "GET",
      headers: { "user-agent": "node.js" }
    };
    request(option, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode != 200) {
        return res.status(404).json({ msg: "No profile For github" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server Error");
  }
});

module.exports = route;
