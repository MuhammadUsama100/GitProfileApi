const express = require("express");
const route = express.Router();

route.get("/", (req, res) => res.send("profile"));

module.exports = route;
