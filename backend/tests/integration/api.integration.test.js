import { vi, describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import supertest from "supertest";
import { createRequire } from "module";

const cjsRequire = createRequire(import.meta.url);
const jwtHelper = cjsRequire("../../helper/jwt");
const helpers = cjsRequire("../../helper/helpers");
const { User, Article } = cjsRequire("../../models");

jwtHelper.jwtSign = vi.fn().mockResolvedValue("mocked-jwt-token");
jwtHelper.jwtVerify = vi.fn().mockResolvedValue({ email: "test@test.com", username: "testuser" });

helpers.slugify = (title) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
helpers.appendTagList = vi.fn();
helpers.appendFollowers = vi.fn();
helpers.appendFavorites = vi.fn();

let app;
let request;

beforeAll(async () => {
  const { default: createTestApp } = await import("../setup/testApp.js");
  app = createTestApp();
  request = supertest(app);
});

beforeEach(() => {
  vi.clearAllMocks();
  jwtHelper.jwtSign.mockResolvedValue("mocked-jwt-token");
  jwtHelper.jwtVerify.mockResolvedValue({ email: "test@test.com", username: "testuser" });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("API Tests", () => {
  
  test("POST /api/users register works and returns user without password", async () => {
    const username = "testuser";
    const email = "test@test.com";
    const password = "password123";
    const bio = "WAT? :)";
    const image = "https://avatar.com/test";
    const token = "mocked-jwt-token";

    const findOneSpy = vi.spyOn(User, "findOne").mockResolvedValue(null);
    const createSpy = vi.spyOn(User, "create").mockResolvedValue({
      id: 42,
      email,
      username,
      bio,
      image,
      password: "password123",
      dataValues: { email, username, bio, image },
      toJSON() {
        return {
          email: this.email,
          username: this.username,
          bio: this.bio,
          image: this.image,
          token: this.dataValues.token,
        };
      },
    });

    jwtHelper.jwtSign.mockResolvedValue(token);

    const res = await request
      .post("/api/users")
      .send({ user: { username, email, password } });

    expect(res.status).toBe(201);
    
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email, username })
    );

    expect(res.body).toEqual({
      user: { username, email, bio, image, token },
    });
    
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.id).toBeUndefined();
  });

  test("POST /api/users returns 422 error if username is missing", async () => {
    const email = "test@test.com";
    const password = "password123";
    const expectedErrorMessage = "A username is required";

    const res = await request
      .post("/api/users")
      .send({ user: { email, password } });

    expect(res.status).toBe(422);

    expect(res.body).toEqual({
      errors: {
        body: [expectedErrorMessage],
      },
    });
  });

  test("POST /api/articles creates a new article with tags and author info", async () => {
    const username = "testuser";
    const email = "test@test.com";
    const token = "dummy-token";

    const title = "Some title";
    const slug = "some-title";
    const description = "A brief description of the article.";
    const body = "Lorem ipsum dolor sit amet. Body of the article.";
    const tagList = [];

    const mockLoggedUser = {
      id: 1,
      username,
      email,
      dataValues: { token },
      toJSON() {
        return { username: this.username, bio: null, image: null };
      },
    };
    const userFindOneSpy = vi.spyOn(User, "findOne").mockResolvedValue(mockLoggedUser);
    
    const articleFindOneSpy = vi.spyOn(Article, "findOne").mockResolvedValue(null);
    const articleCreateSpy = vi.spyOn(Article, "create").mockResolvedValue({
      id: 99,
      slug,
      title,
      description,
      body,
      userId: mockLoggedUser.id,
      dataValues: {},
      toJSON() {
        return {
          slug: this.slug,
          title: this.title,
          description: this.description,
          body: this.body,
          tagList: this.dataValues.tagList,
          author: this.dataValues.author,
        };
      },
    });

    const res = await request
      .post("/api/articles")
      .set("Authorization", `Token ${token}`)
      .send({ article: { title, description, body, tagList } });

    expect(res.status).toBe(201);
    
    expect(articleCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title, description, body, userId: mockLoggedUser.id })
    );

    expect(res.body).toEqual({
      article: {
        slug,
        title,
        description,
        body,
        tagList,
        author: expect.objectContaining({ username }),
      },
    });
  });
});
