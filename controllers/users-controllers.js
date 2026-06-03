//const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const httpError = new HttpError(
      "Fetching users failed, please try again later.",
      500,
    );
    return next(httpError);
  }

  res.json({
    users: users.map((user) => {
      return user.toObject({ getters: true });
    }),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const httpError = new HttpError(
      "Signing up failed, please try again later.",
      500,
    );
    return next(httpError);
  }

  if (existingUser) {
    const httpError = new HttpError(
      "User exists already, please login instead",
      422,
    );
    return next(httpError);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const httpError = new HttpError(
      "Could not create user, please try again.",
      500,
    );
    return next(httpError);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    const httpError = new HttpError(
      "Signing up failed, please try again.",
      500,
    );
    return next(httpError);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );
  } catch (error) {
    const httpError = new HttpError(
      "Signing up failed, please try again.",
      500,
    );
    return next(httpError);
  }

  res
    .status(201)
    .json({ user: createdUser.toObject({ getters: true }), token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const httpError = new HttpError(
      "Logging in failed, please try again later.",
      500,
    );
    return next(httpError);
  }

  if (!existingUser) {
    const httpError = new HttpError(
      "Invalid credentials, could not log you in.",
      403,
    );
    return next(httpError);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    const httpError = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500,
    );
    return next(httpError);
  }

  if (!isValidPassword) {
    const httpError = new HttpError(
      "Invalid credentials, could not log you in.",
      403,
    );
    return next(httpError);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );
  } catch (error) {
    const httpError = new HttpError(
      "Logging in failed, please try again.",
      500,
    );
    return next(httpError);
  }

  res.json({
    message: "Logged In!",
    user: existingUser.toObject({ getters: true }),
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
