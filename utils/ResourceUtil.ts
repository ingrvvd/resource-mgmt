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

export const viewResources = async (req: Request, res: Response) => {
  try {
    const allResources = await readJSON("utils/resources.json");
    return res.status(201).json(allResources);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const updateResourceValidation = [
  check("name").optional().trim().notEmpty().withMessage("Name is required."),

  check("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location is required."),

  check("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
];

export const editResource = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.params.id;
  const name = req.body.name;
  const location = req.body.location;
  const description = req.body.description;
  try {
    const allResources = await readJSON("utils/resources.json");

    const resourceIndex = allResources.findIndex(
      (resource: any) => resource.id === id
    );
    if (resourceIndex === -1) {
      return res
        .status(404)
        .json({ message: "Resource not found, unable to modify!" });
    }

    const updatedResource = {
      ...allResources[resourceIndex],
      name,
      location,
      description
    };
    allResources[resourceIndex] = updatedResource;

    try {
      await fs.writeFile(
        "utils/resources.json",
        JSON.stringify(allResources),
        "utf8"
      );
      return res
        .status(200)
        .json({ message: "Resource modified successfully!" });
    } catch (writeError) {
      return res.status(500).json({ message: "Failed to save modifications." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to read resources." });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const allResources = await readJSON("utils/resources.json");
    var index = -1;
    for (var i = 0; i < allResources.length; i++) {
      var curcurrResource = allResources[i];
      if (curcurrResource.id == id) index = i;
    }
    if (index != -1) {
      allResources.splice(index, 1);
      await fs.writeFile(
        "utils/resources.json",
        JSON.stringify(allResources),
        "utf8"
      );
      return res
        .status(200)
        .json({ message: "Resource deleted successfully!" });
    } else {
      return res
        .status(500)
        .json({ message: "Error occurred, unable to delete!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
