import { Page, Locator } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.locator('input[name="username"]');
    this.emailField = page.locator('input[name="email"]');
    this.passwordField = page.locator('input[name="password"]');
    this.submitButton = page.getByRole("button", { name: /login|sign up/i });
  }

  async login(email: string, password: string) {
    await this.page.goto("/#/login");
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async register(username: string, email: string, password: string) {
    await this.page.goto("/#/register");
    await this.usernameField.fill(username);
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}