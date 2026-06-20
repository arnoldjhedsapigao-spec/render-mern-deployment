const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { validatorResult, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const place = require("../models/place");

const getPlaceById = async (req, res, next) => {
  console.log("GET request in places.");

  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const httpError = new HttpError(
      "Something went wrong, could not find a place.",
      500,
    );
    return next(httpError);
  }

  if (!place) {
    const httpError = new HttpError(
      "Could not find a place for the provided ID.",
      404,
    );
    return next(httpError);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    const httpError = new HttpError(
      "Fetching places failed, please try again later.",
      500,
    );
    return next(httpError);
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true }),
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(
      new HttpError("Invalid inputs passed, please check your address.", 422),
    );
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    const httpError = new HttpError(
      "Creating place failed, please try again.",
      500,
    );
    return next(httpError);
  }

  if (!user) {
    const httpError = new HttpError(
      "Could not find user for provided creator ID.",
      500,
    );
    return next(httpError);
  }

  console.log({ user: user });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });

    user.places.push(createdPlace);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (error) {
    const httpError = new HttpError(
      "Creating place failed, please try again.",
      500,
    );
    return next(httpError);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (error) {
    const httpError = new HttpError(
      "Something went wrong, could not update a place.",
      500,
    );
    return next(httpError);
  }

  if (updatedPlace.creator.toString() !== req.userData.userId) {
    const httpError = new HttpError(
      "You are not allowed to edit this place.",
      401,
    );
    return next(httpError);
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (error) {
    const httpError = new HttpError(
      "Something went wrong, could not update a place.",
      500,
    );
    return next(httpError);
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let deletedPlace;
  try {
    deletedPlace = await Place.findById(placeId).populate("creator");
  } catch (error) {
    const httpError = new HttpError(
      "Something went wrong, could not delete a place.",
      500,
    );
    return next(httpError);
  }

  if (!deletedPlace) {
    const httpError = new HttpError(
      "Could not find place for this place ID.",
      500,
    );
    return next(httpError);
  }

  if (deletedPlace.creator.id !== req.userData.userId) {
    const httpError = new HttpError(
      "You are not allowed to delete this place.",
      401,
    );
    return next(httpError);
  }

  const imagePath = deletedPlace.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await deletedPlace.deleteOne({ _id: placeId, session: sess });

    deletedPlace.creator.places.pull(deletedPlace);
    await deletedPlace.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (error) {
    const httpError = new HttpError(
      "Something went wrong, could not delete a place.",
      500,
    );
    return next(httpError);
  }

  fs.unlink(imagePath, (error) => {
    console.log(error);
  });

  res.status(200).json({ message: "Deleted a place.", place: deletedPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
