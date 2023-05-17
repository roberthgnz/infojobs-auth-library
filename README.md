# InfoJobs API Authentication Library: Node.js Client

This is InfoJobs's unofficially supported [node.js](http://nodejs.org/) client library for using OAuth 2.0 authorization and authentication with InfoJobs API.

- [Quickstart](#quickstart)

  - [Installing the client library](#installing-the-client-library)

- [How to use](#how-to-use)

  - [A complete OAuth2 example](#a-complete-oauth2-example)

## Quickstart

### Installing the client library

```bash
npm install infojobs-auth-library
```

## How to use

This library comes with `OAuth2` class, you will use to generate URLs, get tokens, and refresh tokens.

#### A complete OAuth2 example

Let's take a look at a complete example.

```javascript
const { OAuth2 } = require('infojobs-auth-library');

const auth = new OAuth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// Generate the url that will be used for the consent dialog.
const authUrl = auth.generateAuthUrl({
  responseType: 'code',
  scope: ['MY_APPLICATIONS'],
});

(async () => {
  const token = await auth.getAccessToken('2e386b32-af9a-4891-8caa-d1e3d7721f2');

  console.log(token);
  /**
   * {
   *  access_token: '2e386b32-af9a-4891-8caa-d1e3d7721f2',
   *  token_type: 'bearer',
   *  expires_in: 3599,
   *  refresh_token: '2e386b32-af9a-4891-8caa-d1e3d7721f2',
   */

  await auth.refreshAccessToken(token.refresh_token);
})();
```
