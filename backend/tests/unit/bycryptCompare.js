const { bcryptHash, bcryptCompare } = require("../../helper/bcrypt");

describe("bcrypt helper", () => {
  test("bcryptCompare validates a matching password and rejects a wrong one", async () => {
    const password = "mySecretPassword123";
    const hash = await bcryptHash(password);

    const match = await bcryptCompare(password, hash);
    expect(match).toBe(true);

    const noMatch = await bcryptCompare("wrongPassword", hash);
    expect(noMatch).toBe(false);
  });
});
