import { Page, Locator } from "@playwright/test";

export class ArticlePage {
  readonly page: Page;
  readonly articleTitle: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly deleteArticleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articleTitle = page.locator(".article-page h1");
    this.commentInput = page.getByPlaceholder("Write a comment...");
    this.postCommentButton = page.getByRole("button", { name: "Post Comment" });
    this.deleteArticleButton = page.getByRole("button", { name: "Delete Article" }).first();
  }

  async addComment(text: string) {
    await this.commentInput.fill(text);
    await this.postCommentButton.click();
  }
}
