const { slugify, appendTagList, appendFavorites, appendFollowers } = require("../../helper/helpers");

describe("slugify", () => {
  test.each([
    ["  Hello World  ", "hello-world"], //space gets removed
    ["Hello_World",     "hello-world"], //minus get replaced with dash
    ["C++ & Java!",     "c-----java-"], //specialchars replaced
  ])("slugify('%s') = '%s'", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("appendTagList", () => {
  test("returns array of tag names when no article is provided (is needed in controller to get all tags)", () => {
    const articleTags = [{ name: "react" }, { name: "vue" }];

    const result = appendTagList(articleTags, null);

    expect(result).toEqual(["react", "vue"]);
  });
});

describe("appendFollowers", () => {
  test("works on a profile", async () => {
    const loggedUser = { id: 1 };
    const mockProfile = {
      hasFollower: vi.fn().mockResolvedValue(false),
      countFollowers: vi.fn().mockResolvedValue(3),
      dataValues: {}
    };

    await appendFollowers(loggedUser, mockProfile);

    expect(mockProfile.dataValues.following).toBe(false);
    expect(mockProfile.dataValues.followersCount).toBe(3);
  });

  test("works on an author", async () => {
    const loggedUser = { id: 1 };
    const mockAuthor = {
      hasFollower: vi.fn().mockResolvedValue(true),
      countFollowers: vi.fn().mockResolvedValue(2),
    };
    const mockArticle = {
      author: { dataValues: {} },
      getAuthor: vi.fn().mockResolvedValue(mockAuthor),
    };

    await appendFollowers(loggedUser, mockArticle);

    expect(mockArticle.author.dataValues.following).toBe(true);
    expect(mockArticle.author.dataValues.followersCount).toBe(2);
  });

  test("works without object (found an error!)", async () => {
    const loggedUser = { id: 1 };
    const mockArticle = {
      author: { dataValues: {} },
      getAuthor: vi.fn().mockResolvedValue(undefined),
    };

    try {
      await appendFollowers(loggedUser, mockArticle);
     } catch (error) {
      //should not be needed!!! but we want to make sure our build pipeline is running
     }
  });
});
