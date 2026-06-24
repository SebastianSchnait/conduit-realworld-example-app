import { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly navBrand: Locator;
  readonly userNavbarLink: Locator;
  readonly globalFeedTab: Locator;
  readonly tagPills: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBrand = page.locator(".navbar-brand");
    this.userNavbarLink = page.locator(".dropdown-toggle");
    this.globalFeedTab = page.getByText("Global Feed");
    this.tagPills = page.locator(".tag-default");
  }

  async goto() {
    await this.page.goto("/#/");
  }

  async logout() {
    await this.userNavbarLink.click();
    await this.page.getByRole("link", { name: /logout/i }).click();
  }
}
