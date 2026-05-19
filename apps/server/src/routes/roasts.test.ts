import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";

const app = createApp();

describe("POST /api/v1/roasts", () => {
  beforeAll(async () => {
    await prisma.roast.deleteMany({});
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("never echoes the password in the response", async () => {
    const res = await request(app)
      .post("/api/v1/roasts")
      .send({ password: "hunter2", nickname: "tester", isPublic: false });
    expect(res.status).toBe(201);
    const text = JSON.stringify(res.body);
    expect(text.toLowerCase()).not.toContain("hunter2");
    expect(res.body.severity).toBeDefined();
    expect(res.body.ownerToken).toMatch(/.{16,}/);
  });

  it("requires the owner token to delete", async () => {
    const create = await request(app)
      .post("/api/v1/roasts")
      .send({ password: "Tr0ub4dor&3", isPublic: true });
    const id = create.body.id as string;

    const noToken = await request(app).delete(`/api/v1/roasts/${id}`);
    expect(noToken.status).toBe(403);

    const withToken = await request(app)
      .delete(`/api/v1/roasts/${id}`)
      .set("X-Owner-Token", create.body.ownerToken);
    expect(withToken.status).toBe(204);
  });

  it("rejects empty passwords", async () => {
    const res = await request(app).post("/api/v1/roasts").send({ password: "" });
    expect(res.status).toBe(400);
  });

  it("public listing excludes private roasts", async () => {
    const a = await request(app)
      .post("/api/v1/roasts")
      .send({ password: "MyPrivateOne!42xyz", isPublic: false });
    const b = await request(app)
      .post("/api/v1/roasts")
      .send({ password: "MyPublicOne!42xyz", isPublic: true });

    const list = await request(app).get("/api/v1/roasts");
    const ids = (list.body.items as { id: string }[]).map((i) => i.id);
    expect(ids).toContain(b.body.id);
    expect(ids).not.toContain(a.body.id);
  });
});
