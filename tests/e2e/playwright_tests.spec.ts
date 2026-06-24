import { test, expect } from "@playwright/test";
import { AuthPage } from "./poms/AuthPage";
import { HomePage } from "./poms/HomePage";
import { ArticlePage } from "./poms/ArticlePage";
import { EditorPage } from "./poms/EditorPage";

const randomUserHelper = () => {
  const num = Math.floor(Math.random() * 100000);
  return {
    username: `tester_${num}`,
    email: `test_${num}@mail.com`,
    password: `pwd_${num}`
  };
};

test("should register a new user successfully", async ({ page }) => {
  const auth = new AuthPage(page);
  const home = new HomePage(page);
  const user = randomUserHelper();

  await auth.register(user.username, user.email, user.password);

  await expect(home.userNavbarLink).toBeVisible();
  await expect(home.userNavbarLink).toContainText(user.username);
});

test("should login an existing user successfully", async ({ page }) => {
  const auth = new AuthPage(page);
  const home = new HomePage(page);
  const user = randomUserHelper();

  await auth.register(user.username, user.email, user.password);
  await expect(home.userNavbarLink).toContainText(user.username);

  await home.logout();
  await expect(home.userNavbarLink).not.toBeVisible();

  await auth.login(user.email, user.password);

  await expect(home.userNavbarLink).toBeVisible();
  await expect(home.userNavbarLink).toContainText(user.username);
});

test("should create and publish a new article", async ({ page }) => {
  const auth = new AuthPage(page);
  const home = new HomePage(page);
  const editor = new EditorPage(page);
  const article = new ArticlePage(page);
  const user = randomUserHelper();

  await auth.register(user.username, user.email, user.password);
  await expect(home.userNavbarLink).toBeVisible();

  await editor.goto();
  const articleTitle = `A summary of WAT ${Date.now()}`;
  await editor.publishArticle(
    articleTitle,
    "Wonderful Description",
    "Wonderful body text.",
    "simple,test"
  );

  await expect(article.articleTitle).toBeVisible();
  await expect(article.articleTitle).toHaveText(articleTitle);
});

test("should add a comment to an article", async ({ page }) => {
  const auth = new AuthPage(page);
  const home = new HomePage(page);
  const editor = new EditorPage(page);
  const article = new ArticlePage(page);
  const user = randomUserHelper();

  await auth.register(user.username, user.email, user.password);
  await expect(home.userNavbarLink).toBeVisible();

  await editor.goto();
  const articleTitle = `Comment Target Article ${Date.now()}`;
  await editor.publishArticle(
    articleTitle,
    "Target article description",
    "Target article body.",
    "comment"
  );
  await expect(article.articleTitle).toHaveText(articleTitle);

  const commentText = "This is a simple comment from E2E test.";
  await article.addComment(commentText);

  const commentTextLocator = page.locator(".card-text").filter({ hasText: commentText });
  await expect(commentTextLocator).toBeVisible();
});
