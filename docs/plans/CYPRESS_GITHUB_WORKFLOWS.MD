GitHub Actions workflows to automatically run the E2E tests we've defined. I'll provide two workflows:

e2e.yml: Runs the full suite of E2E tests on every push and pull request to the main branch.
nightly.yml: Runs a subset of tests (or the full suite) nightly.
Workflow 1: e2e.yml (Full Suite on Push/PR)

yaml
name: E2E Tests

on:
push:
branches: [ main ]
pull_request:
branches: [ main ]

jobs:
cypress-run:
runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          start: npm start  # Or your start command
          wait-on: 'http://localhost:3000' # Adjust if your app runs on a different port
          browser: chrome # Or specify the browsers you want to test
          record: true # Enable recording to Cypress Cloud
          group: E2E # Group name for the tests
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }} # Your Cypress Cloud record key
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Required for Cypress Cloud integration

Explanation:

name: E2E Tests: The name of the workflow.
on:: Defines when the workflow will run:
push:: On every push to the main branch.
pull_request:: On every pull request targeting the main branch.
jobs:: Defines the jobs that will be executed.
cypress-run:: The name of the job.
runs-on: ubuntu-latest:** Specifies the runner (Ubuntu).
steps:: The steps to be executed within the job.
actions/checkout@v4:** Checks out the code from the repository.
actions/setup-node@v4:** Sets up Node.js.
run: npm ci:** Installs dependencies using npm ci (clean install).
cypress-io/github-action@v6:** Uses the official Cypress GitHub Action to run the tests.
start: npm start:** Starts your application (adjust the command if needed).
wait-on: 'http://localhost:3000':** Waits for your application to be running before starting the tests (adjust the URL if needed).
browser: chrome:** Specifies the browser to use (you can also use firefox, edge, or electron).
record: true:** Enables recording to Cypress Cloud.
group: E2E:** Groups the tests in Cypress Cloud.
env:: Defines environment variables.
CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}:** Your Cypress Cloud record key (stored as a GitHub secret).
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}:** Required for Cypress Cloud integration.
Workflow 2: nightly.yml (Nightly Run)

yaml
name: Nightly E2E Tests

on:
schedule: - cron: '0 0 \* \* \*' # Runs at 00:00 UTC every day

jobs:
cypress-run:
runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          start: npm start  # Or your start command
          wait-on: 'http://localhost:3000' # Adjust if your app runs on a different port
          browser: chrome # Or specify the browsers you want to test
          record: true # Enable recording to Cypress Cloud
          group: Nightly # Group name for the tests
          spec: cypress/e2e/user_flow.cy.js, cypress/e2e/chat.cy.js # Run specific tests
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }} # Your Cypress Cloud record key
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Required for Cypress Cloud integration

Changes from e2e.yml:

on: schedule:: Defines the schedule for the workflow to run.
cron: '0 0 \* \* \*':\*\* Runs at 00:00 UTC every day. You can adjust the cron expression as needed.
spec: cypress/e2e/user_flow.cy.js, cypress/e2e/chat.cy.js: This line is optional. It allows you to specify which test files to run. In this example, it runs only user_flow.cy.js and chat.cy.js. If you remove this line, it will run all tests in your cypress/e2e directory. This is useful if you want to run a smaller subset of tests nightly for faster feedback.
How to Use These Workflows:

Create a .github/workflows directory in the root of your repository.
Create the e2e.yml and nightly.yml files inside the .github/workflows directory.
Commit and push the files to your repository.
Set up the CYPRESS_RECORD_KEY secret in your GitHub repository settings:
Go to your repository's "Settings" tab.
Click on "Secrets" -> "Actions".
Click "New repository secret".
Enter CYPRESS_RECORD_KEY as the name and your Cypress Cloud record key as the value.
Click "Add secret".
Important Notes:

Adjust the start and wait-on values to match your application's startup command and URL.
Choose the appropriate browser for your tests.
Store your Cypress Cloud record key as a GitHub secret for security.
Customize the spec value in nightly.yml to run the tests you want to run nightly.
Consider using a matrix strategy if you want to run your tests across multiple browsers or Node.js versions in parallel.
Review the Cypress GitHub Action documentation for more advanced configuration options: https://github.com/cypress-io/github-action
