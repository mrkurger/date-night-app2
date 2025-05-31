import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ProfilePage extends BasePage {
  // Define selectors for profile page elements
  readonly profileHeader: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly avatarImage: Locator;
  readonly uploadAvatarButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize all locators
    this.profileHeader = page.getByRole('heading', { name: /profile|my account/i });
    this.nameField = page.getByLabel(/name|full name/i);
    this.emailField = page.getByLabel(/email/i);
    this.editButton = page.getByRole('button', { name: /edit|modify/i });
    this.saveButton = page.getByRole('button', { name: /save|update/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.avatarImage = page
      .locator('.avatar-image')
      .or(page.getByAltText(/profile picture|avatar/i));
    this.uploadAvatarButton = page.getByText(/upload|change.*avatar|picture/i);
    this.successMessage = page.getByText(/successfully updated|profile saved/i);
  }

  /**
   * Navigate to profile page
   */
  async goto(): Promise<void> {
    await super.goto('/profile');
    await this.waitForAngular();
  }

  /**
   * Enter edit mode
   */
  async startEditing(): Promise<void> {
    await this.editButton.click();
    // Wait for fields to become editable
    await this.page.waitForTimeout(300);
  }

  /**
   * Update profile information
   */
  async updateProfile(name: string, email: string): Promise<void> {
    await this.startEditing();
    await this.nameField.fill(name);
    await this.emailField.fill(email);
    await this.saveButton.click();
    // Wait for save to complete
    await this.waitForElement(this.successMessage);
  }

  /**
   * Get current profile information
   */
  async getProfileInfo(): Promise<{ name: string; email: string }> {
    const name = await this.nameField.inputValue();
    const email = await this.emailField.inputValue();
    return { name, email };
  }

  /**
   * Upload a new avatar image
   */
  async uploadAvatar(filePath: string): Promise<void> {
    await this.uploadAvatarButton.click();
    // Handle file upload dialog
    await this.page.setInputFiles('input[type="file"]', filePath);
    // Wait for upload to complete
    await this.waitForElement(this.successMessage);
  }
}
