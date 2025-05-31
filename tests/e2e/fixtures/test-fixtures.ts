import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base-page';
import { HomePage } from '../pages/home-page';
import { LoginPage } from '../pages/login-page';
import { NavigationMenu } from '../pages/navigation-menu';
import { ProfilePage } from '../pages/profile-page';

// Declare the types of your fixture
type TestFixtures = {
  basePage: BasePage;
  homePage: HomePage;
  loginPage: LoginPage;
  navigationMenu: NavigationMenu;
  profilePage: ProfilePage;
};

// Extend the base test with your fixtures
export const test = base.extend<TestFixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  navigationMenu: async ({ page }, use) => {
    const navigationMenu = new NavigationMenu(page);
    await use(navigationMenu);
  },

  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },
});

export { expect } from '@playwright/test';
