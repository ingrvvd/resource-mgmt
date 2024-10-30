import { Resource } from "../models/Resource";
import { promises as fs } from "fs";
import { Request, Response } from "express";
import { check, ValidationChain, validationResult } from "express-validator";

export const readJSON = async (filename: string) => {
  try {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const writeJSON = async (object: Resource, filename: string) => {
  try {
    const allObjects = await readJSON(filename);
    allObjects.push(object);
    await fs.writeFile(filename, JSON.stringify(allObjects), "utf8");
    return allObjects;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const addTourValidation = [
  check("name").trim().notEmpty().withMessage("Name is required."),

  check("location").trim().notEmpty().withMessage("Location is required."),

  check("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),

  check("owner")
    .notEmpty()
    .trim()
    .isEmail()
    .withMessage("Owner is required.")
    .matches(emailRegex)
];

export const addResource = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, location, description, owner } = req.body;
    const newResource = new Resource(name, location, description, owner);
    const updatedResources = await writeJSON(
      newResource,
      "utils/resources.json"
    );
    return res.status(201).json(updatedResources);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

