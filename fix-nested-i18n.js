// Script to fix nested i18n markers in HTML templates
const fs = require('fs');
const path = require('path');

// The file to process
const filePath = path.join(
  __dirname,
  'client-angular/src/app/shared/components/chat-message/chat-message.component.html',
);

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // Replace nested i18n markers with a single one
  // This regex matches any number of nested ng-container i18n tags and replaces them with a single one
  let modifiedContent = data.replace(
    /(<ng-container i18n>)+(.+?)(<\/ng-container>)+/g,
    '<ng-container i18n>$2</ng-container>',
  );

  // Write the modified content back to the file
  fs.writeFile(filePath, modifiedContent, 'utf8', err => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log('✅ Successfully fixed nested i18n markers in chat-message.component.html');
  });
});
