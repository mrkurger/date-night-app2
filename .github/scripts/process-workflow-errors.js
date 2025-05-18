name: Error Monitoring

on:
  workflow_run:
    workflows: ["*"]
    types: [completed]
    branches: [main, develop]
    conclusions: [failure, cancelled, timed_out]
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  monitor:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Process Workflow Errors
        id: process-errors
        run: |
          mkdir -p workflow-error-logs
          node .github/scripts/process-workflow-errors.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          WORKFLOW_RUN_ID: ${{ github.event.workflow_run.id }}
          
      - name: Upload Error Reports
        uses: actions/upload-artifact@v4
        with:
          name: workflow-error-logs-${{ github.run_id }}
          path: workflow-error-logs/
          retention-days: ${{ env.ARTIFACTS_RETENTION }}