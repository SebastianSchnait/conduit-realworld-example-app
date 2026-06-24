import { Page, Locator } from "@playwright/test";

export class EditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder("Article Title");
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder("Write your article (in markdown)");
    this.tagsInput = page.getByPlaceholder("Enter tags");
    this.publishButton = page.getByRole("button", { name: /publish article|update article/i });
  }

  async goto() {
    await this.page.goto("/#/editor");
  }

  async publishArticle(title: string, desc: string, body: string, tags: string) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(desc);
    await this.bodyInput.fill(body);
    await this.tagsInput.fill(tags);
    await this.publishButton.click();
  }
}
