import { describe, it } from "mocha";
import chai, { expect } from "chai";
import { app, server } from "../index";
import chaiHttp from "chai-http";
import request from "supertest";

chai.use(chaiHttp);

describe("Resource API", () => {
  let baseUrl: string; // Declare baseUrl at a broader scope

  before(async () => {
    const serverAddress = await server.address();
    if (
      serverAddress &&
      typeof serverAddress === "object" &&
      "address" in serverAddress &&
      "port" in serverAddress
    ) {
      const { address, port } = serverAddress;
      baseUrl = `http://${address === "::" ? "localhost" : address}:${port}`;
    } else {
      throw new Error("Server address could not be retrieved");
    }
  });

  after(async () => {
    return new Promise(resolve => {
      server.close(() => {
        resolve();
      });
    });
  });

  let count = 0;
  let resourceId: String;

  describe("POST /add-resource", () => {
    it("should add a new resource", async () => {
      const res = await request(baseUrl).post("/add-resource").send({
        name: "Resource 1",
        location: "Location of resource 1",
        description: "This is a resource",
        owner: "resource@email.com"
      });

      // Add assertions here based on expected behavior
      count = res.body.length;
      resourceId = res.body[res.body.length - 1].id;
      expect(res).to.have.status(201);
      expect(res.body).to.be.an("array");
    });

    it("should return 400 for invalidation", async () => {
      const res = await request(baseUrl).post("/add-resource").send({
        name: "Resource 1",
        location: "Location of resource 1",
        description: "This is a resource",
        owner: "resourceemail.com"
      });
      expect(res).to.have.status(400);
    });

    it("should return 404 for wrong path", async () => {
      const res = await request(baseUrl).post("/wrong-path").send({
        name: "Resource 1",
        location: "Location of resource 1",
        description: "This is a resource",
        owner: "resource@email.com"
      });
      expect(res).to.have.status(404);
    });
  });
  it("should return 500 for indecent data", async () => {
    const res = await request(baseUrl).post("/add-resource").send({
      name: "fuck",
      location: "Location of resource 1",
      description: "This is a resource",
      owner: "resource@email.com"
    });
    expect(res).to.have.status(500);
  });

  describe("GET /view-resources", async () => {
    it("should return all resources", async () => {
      const res = await request(baseUrl).get("/view-resources");
      expect(res).to.have.status(200);
    });
    it("should return a 404 for wrong path", async () => {
      const res = await request(baseUrl).get("/wrong-path");
      expect(res).to.have.status(404);
    });
  });
  describe("GET /view-resource/:id", async () => {
    it("should return a resource via ID", async () => {
      const res = await request(baseUrl).get(`/view-resource/${resourceId}`);
      expect(res).to.have.status(200);
    });
    it("should return a 404 for wrong path", async () => {
      const res = await request(baseUrl).get("/wrong-path");
      expect(res).to.have.status(404);
    });
    it("should return a 404 for invalid id", async () => {
      const res = await request(baseUrl).get("/view-resource/invalid-id");
      expect(res).to.have.status(404);
    });
  });

  describe("PUT /edit-resource/:id", async () => {
    it("should return a 200 for valid data", async () => {
      const res = await request(baseUrl)
        .put(`/edit-resource/${resourceId}`)
        .send({
          name: "Resource 2",
          location: "Location of resource 2",
          description: "This is a resource"
        });
      expect(res).to.have.status(200);
    });

    it("should return a 400 for invalidation", async () => {
      const res = await request(baseUrl)
        .put(`/edit-resource/${resourceId}`)
        .send({
          name: "",
          location: "resource 2 location",
          description: "lmao"
        });
      expect(res).to.have.status(400);
    });

    it("should return 404 for invalid path", async () => {
      const res = await request(baseUrl).put("/wrong-path");
      expect(res).to.have.status(404);
    });

    it("should return a 404 for invalid/missing id", async () => {
      const res = await request(baseUrl).put("/edit-resource/invalid-id");
      expect(res).to.have.status(404);
    });

    it("should return a 500 for indecent data", async () => {
      const res = await request(baseUrl).put("/edit-resource/1").send({
        name: "fuck",
        location: "resource 2 location",
        description: "lmao"
      });
      expect(res).to.have.status(500);
    });
  });

  describe("DELETE /delete-resource/id", async () => {
    it("should return a 200 for valid id", async () => {
      const res = await request(baseUrl).delete(
        `/delete-resource/${resourceId}`
      );
      expect(res).to.have.status(200);
    });

    it("should return a 404 for already deleted data", async () => {
      const res = await request(baseUrl).delete(
        `/delete-resource/${resourceId}`
      );
      expect(res).to.have.status(404);
    });

    it("should return a 404 for invalid data", async () => {
      const res = await request(baseUrl).delete("/delete-resource/invalid-id");
      expect(res).to.have.status(404);
    });
  });
});
