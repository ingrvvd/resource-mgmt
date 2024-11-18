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

export const addResource = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, location, description, owner } = req.body;
    const newResource = new Resource(name, location, description, owner);
    if (name === "fuck") {
      throw new Error("Simulated server error");
    }
    const updatedResources = await writeJSON(
      newResource,
      "utils/resources.json"
    );
    res.status(201).json(updatedResources);
  } catch (error) {
    res.status(500).json({ message: "cannot post" });
  }
};

export const viewResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const allResources = await readJSON("utils/resources.json");
    res.status(200).json(allResources);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const viewResourceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const resources = await readJSON("utils/resources.json");
    const resource = resources.find((resource: Resource) => resource.id === id);

    if (!resource) {
      res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error("Error retrieving resource:", error); // Helpful for debugging
    res.status(500).json({
      message: "An error occurred while retrieving the resource."
    });
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

export const editResource = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  const id = req.params.id;
  const name = req.body.name;
  const location = req.body.location;
  const description = req.body.description;
  try {
    const allResources = await readJSON("utils/resources.json");
    if (name === "fuck") {
      throw new Error("Simulated server error");
    }

    const resourceIndex = allResources.findIndex(
      (resource: any) => resource.id === id
    );
    if (resourceIndex === -1) {
      res
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
      res.status(200).json({ message: "Resource modified successfully!" });
    } catch (writeError) {
      res.status(400).json({ message: "Failed to save modifications." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to read resources." });
  }
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const allResources = await readJSON("utils/resources.json");
    let index = -1;

    // Find the index of the resource to delete
    for (let i = 0; i < allResources.length; i++) {
      const currentResource = allResources[i];
      if (currentResource.id === id) {
        index = i;
        break;
      }
    }

    // Handle the resource not found
    if (index === -1) {
      res.status(404).json({ message: "Resource not found!" });
    }

    // Remove the resource and update the file
    allResources.splice(index, 1);
    await fs.writeFile(
      "utils/resources.json",
      JSON.stringify(allResources, null, 2), // Use indentation for better readability
      "utf8"
    );

    res.status(200).json({ message: "Resource deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
