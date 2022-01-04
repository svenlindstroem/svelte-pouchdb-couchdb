# Shopping List App

This repo is a Svelte implementation of SPA PWA [ibm-watson-data-lab/shopping-list](https://github.com/ibm-watson-data-lab/shopping-list).

"[Shopping list](https://github.com/ibm-watson-data-lab/shopping-list) is a series of Offline First demo apps, each built using a different stack. This is a JavaScript implementation of the domain model for the Shopping List app. This package may be used in Vanilla JS, Polymer, React, Preact, Vue.js, Ember.js, React Native, Ionic, Cordova, Electron, and any other JavaScript implementation of the Shopping List demo app."

To check out the demo click [here](https://shopping-list-svelte-pouchdb.vercel.app/).

# Install app locally

```bash
nvm use
npm i
npm run dev
```

# Run CouchDB locally

Download Apache CouchDB from [here](https://couchdb.apache.org/#download).

Install and open [http://localhost:5984/\_utils/](http://localhost:5984/_utils/).

Login with username admin and password admin.

Create a new database 'shopping'.

# Foward local db port with ngrok

Download the free ngrok version from here: [https://ngrok.com/](https://ngrok.com/) and install.

´´´bash
cd ngrok
./ngrok http 5984
´´´

Copy and edit the https url. Should look like this: https://username:password@6d39-77-10-152-42.ngrok.io/shopping.

Paste the edited url into settings.

# Svelte starting point

`npx degit sveltejs/template shopping-list-svelte-pouchdb`

`cd shopping-list-svelte-pouchdb`

`npm install`

`npm run dev`

[opens on http://localhost:5000](http://localhost:5000)

# svelte app

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

`npx degit sveltejs/template shopping-list-svelte-pouchdb`

`cd shopping-list-svelte-pouchdb`

`npm install`

`npm run dev`

[opens on http://localhost:5000](http://localhost:5000)

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

_Note that you will need to have [Node.js](https://nodejs.org) installed._

## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for _any_ path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Using TypeScript

This template comes with a script to set up a TypeScript development environment, you can run it immediately after cloning the template with:

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```

If you want to use `baseUrl` or `path` aliases within your `tsconfig`, you need to set up `@rollup/plugin-alias` to tell Rollup to resolve the aliases. For more info, see [this StackOverflow question](https://stackoverflow.com/questions/63427935/setup-tsconfig-path-in-svelte).

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```
