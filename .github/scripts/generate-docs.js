name: Generate Documentation

on:
  push:
    branches: [main]
    paths:
      - '**/*.ts'
      - '**/*.js'
      - 'docs/**/*'
      - '.github/workflows/generate-docs.yml'
  workflow_dispatch:

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: ./.github/actions/setup-nodejs
        
      - name: Generate Documentation
        run: |
          for dir in $(find . -type d -not -path "*/\.*" -not -path "*/node_modules/*"); do
            # Create required HTML files if missing
            for doc in CHANGELOG.html AILESSONS.html GLOSSARY.html; do
              if [ ! -f "$dir/$doc" ]; then
                echo "Creating $dir/$doc"
                cp .github/templates/$doc "$dir/$doc" 2>/dev/null || echo "<!DOCTYPE html><html><body><h1>$doc</h1></body></html>" > "$dir/$doc"
              fi
            done
          done
          
      - name: Update Global Index
        run: node .github/scripts/generate-docs-index.js
        
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add "**/*.html"
          
          if git diff --staged --quiet; then
            echo "No documentation changes"
          else
            git commit -m "docs: update documentation [skip ci]"
            git pull --rebase origin main || {
              echo "Pull failed, creating PR"
              BRANCH="docs/update-$(date +%Y%m%d-%H%M%S)"
              git checkout -b "$BRANCH"
              git push -u origin "$BRANCH"
              gh pr create --title "Update Documentation" \
                          --body "Automated documentation update" \
                          --base main \
                          --head "$BRANCH"
            }
            git push || true
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}