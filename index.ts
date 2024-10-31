import express from "express";
import bodyParser from "body-parser";
import {addResource, viewResources, editResource, deleteResource, updateResourceValidation, addResourceValidation } from "./utils/ResourceUtil";

export const app = express();
const PORT = process.env.PORT || 5050;
const startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/" + startPage);
});

app.post('/add-resource', addResourceValidation, addResource)
app.get('/view-resources', viewResources)
app.put('/edit-resource/:id', updateResourceValidation, editResource)
app.delete('/delete-resource/:id', deleteResource)

export const server = app.listen(PORT, () => {
  const address = server.address();

  // Ensure address is not null and has the correct type
  if (address && typeof address !== "string") {
    const baseUrl = `http://${address.address === "::"
      ? "localhost"
      : address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
  } else {
    console.error("Server address is not available");
  }
});
