const { readFileSync, readdirSync } = require("fs");
const {basename} = require("path");

const { App } = require("@octokit/app");
const Octokit = require("@octokit/rest");

const APP_ID = process.env.APP_ID;
const PRIVATE_KEY = readFileSync(process.env.PRIVATE_KEY_FILE, "utf8");

const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY });
const octokit = new Octokit({
 async auth() {
   const installationAccessToken = await app.getInstallationAccessToken({
     installationId: process.env.INSTALLATION_ID
   });
     return `token ${installationAccessToken}`;
   }
});

// Commit constants
const REPO = 'codelabs';
const OWNER = 'dalthviz';
const BRANCH = 'staging';
const BASE_PATH = 'codelabs/';
const BASE = 'master';

const commitFile = async (path, fileContent) => {
   const existingFile = await octokit.repos.getContents({
     owner: OWNER,
     repo: REPO,
     path,
     ref: BRANCH
   }).catch(async (err) => {
     console.log(err);
     const newFile = await octokit.repos.createOrUpdateFile(
     {owner: OWNER,
      repo: REPO,
      branch: BRANCH,
      path,
      content: fileContent, 
      message: 'Update ' + path,
     });
     return newFile;
   });
  if(existingFile && existingFile.data){
    console.log(existingFile.data.sha);

    return await octokit.repos.createOrUpdateFile(
     {owner: OWNER,
      repo: REPO,
      branch: BRANCH,
      path,
      content: fileContent, 
      message: 'Update ' + path,
      sha: existingFile.data.sha});
  }
}

exports.commitBuild = async (baseDir) => {
  baseDir = baseDir.trim();
  console.log(baseDir);
  
  // index
  const indexPath = BASE_PATH + baseDir + '/index.html';
  const indexFile = new Buffer(readFileSync(__dirname+ '/' + indexPath)).toString('base64');
  const indexCommit = await commitFile(indexPath, indexFile);
  console.log(indexCommit.data.commit.message);

  // codelabs.json
  const codelabsJsonPath = BASE_PATH + baseDir + '/codelab.json';
  const codelabsJsonFile = new Buffer(readFileSync(__dirname+ '/' + codelabsJsonPath)).toString('base64');;
  const codelabsJsonCommit = await commitFile(codelabsJsonPath, codelabsJsonFile);
  console.log(codelabsJsonCommit.data.commit.message);

  // img
  const baseImgPath = __dirname + '/' + BASE_PATH + baseDir + '/img/';
  const images = readdirSync(baseImgPath);
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imgPath = BASE_PATH + baseDir + '/img/' + image;
    const imgFile = new Buffer(readFileSync(baseImgPath + image)).toString('base64');
    const imgCommit = await commitFile(imgPath, imgFile);
    console.log(imgCommit.data.commit.message);
  }
  
  // Open pull request
  const pullRequest = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: 'Update codelabs',
    head: BRANCH,
    base: BASE
  }).catch((err) => {
    console.log(err.errors);
    //Already a PR existis or no changes are detected between the branches (master vs staging)
    return {data: {}};
  });
  console.log(pullRequest.data.url);
};