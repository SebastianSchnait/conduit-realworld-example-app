// @vitest-environment node
import { describe, test, expect, beforeAll, beforeEach, afterAll } from "vitest";
import models from "../../models";

const { sequelize, User, Article, Tag } = models;

beforeAll(async () => {
  await sequelize.authenticate();
});

beforeEach(async () => {
  const testUsernames = ["dbtestuser", "tagauthor", "follower", "followed"];

  await sequelize.query(
    `DELETE FROM [Followers]
     WHERE [userId]     IN (SELECT [id] FROM [Users] WHERE [username] IN (:names))
        OR [followerId] IN (SELECT [id] FROM [Users] WHERE [username] IN (:names))`,
    { replacements: { names: testUsernames } }
  );

  await Article.destroy({ where: { slug: ["wat-ist-das"] } });

  await Tag.destroy({ where: { name: ["vitest-v3.0#alpha!"] } });

  await User.destroy({ where: { username: testUsernames } });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Database Tests", () => {

  test("User from DB should be without password", async () => {
    const user = await User.create({
      username: "dbtestuser",
      email: "dbtest@example.com",
      password: "secure_raw_password",
      bio: "Database test bio",
      image: "http://example.com/image.png",
    });

    const fetched = await User.findOne({ where: { email: user.email } });
    expect(fetched.username).toBe(user.username);

    const json = fetched.toJSON();
    expect(json.username).toBe(user.username);
    expect(json.email).toBe(user.email);
    expect(json.password).toBeUndefined();
    expect(json.id).toBeUndefined();
  });

  test("Article can have tags with special characters", async () => {
    const author = await User.create({
      username: "tagauthor",
      email: "tagauthor@example.com",
      password: "password123",
    });

    const article = await Article.create({
      slug: "wat-ist-das",
      title: "WAT ist das",
      description: "Testen",
      body: "integration",
      userId: author.id,
    });

    const tag = await Tag.create({ name: "vitest-v3.0#alpha!" });
    await article.addTagList(tag);

    const fetched = await Article.findOne({
      where: { id: article.id },
      include: [{ model: Tag, as: "tagList" }],
    });

    expect(fetched.tagList).toHaveLength(1);
    expect(fetched.tagList[0].name).toBe("vitest-v3.0#alpha!");
  });

  test("Follower relationship works both ways", async () => {
    const follower = await User.create({
      username: "follower",
      email: "follower@example.com",
      password: "password",
    });

    const followed = await User.create({
      username: "followed",
      email: "followed@example.com",
      password: "password",
    });

    await follower.addFollowing(followed);

    const fetchedFollower = await User.findOne({
      where: { id: follower.id },
      include: [{ model: User, as: "following" }],
    });
    expect(fetchedFollower.following[0].username).toBe("followed");

    const fetchedFollowed = await User.findOne({
      where: { id: followed.id },
      include: [{ model: User, as: "followers" }],
    });
    expect(fetchedFollowed.followers[0].username).toBe("follower");
  });
});
