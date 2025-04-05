#!/bin/bash

# Navigate to the Angular client directory
cd client-angular

# Add Angular Universal to the project
ng add @nguniversal/express-engine

# Install additional dependencies for SSR
npm install --save @nguniversal/express-engine @nguniversal/common

echo "Angular Universal has been added to the project!"
echo "You can now build and run the SSR version with:"
echo "npm run build:ssr && npm run serve:ssr"