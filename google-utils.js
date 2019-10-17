const { google } = require('googleapis');
const claat = require('./claat.js');

/*******************/
/** CONFIGURATION **/
/*******************/
// Based on: https://medium.com/@jackrobertscott/how-to-use-google-auth-api-with-node-js-888304f7e3a0

const googleConfig = {
  clientId: process.env.CLIENT_ID, // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
  clientSecret: process.env.CLIENT_SECRET, // e.g. _ASDFA%DFASDFASDFASD#FAD-
  redirect: 'https://'+process.env.PROJECT_DOMAIN+'.glitch.me/login/google/return', // this must match your google api settings
};

const defaultScope = [
  'https://www.googleapis.com/auth/drive.readonly',
];

const createConnection = () => {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

const getConnectionUrl = (auth) => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

exports.urlGoogle = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
}

exports.getGoogleDriveDocFromCode = async (code, docId, callback) => {
  const auth = createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;
  auth.setCredentials(tokens);
  claat.run('codelabs', 'export', tokens.access_token, 'html', [docId], callback);
};