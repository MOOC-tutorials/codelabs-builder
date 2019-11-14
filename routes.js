const url = require('url');
const {urlGoogle, getGoogleDriveDocFromCode} = require('./google-utils');
const {commitBuild} = require('./github-utils.js');


module.exports = (app) => {
  // index route
  app.get('/', (req, res) => {
    res.redirect(urlGoogle());
  });

  // Auth code return
  app.get('/login/google/return', 
    (req, res) => {
    const key = url.parse(req.url, true).query
    const {code} = key;
    res.redirect('/success?code=' + code);
    }
  );

  // Handle build of codelab, docId, code for token
  app.get('/success',
    (req, res) => {
        const key = url.parse(req.url, true).query
        if (Object.keys(key).length > 0) {
          // If they submit a key, get the data
          if(key.code && key.key){
            req.session.code = key.code
            getGoogleDriveDocFromCode(key.code, key.key, async (output) => {
              const baseDir = output.split('\t').pop();
              commitBuild(baseDir);
              res.redirect('codelabs');
            });
          } else if (key.code) {
            req.session.code = key.code;
            // If there is no key, but a code exists load the success page
            res.sendFile(__dirname + '/views/success.html');
          } else if (key.key){
            if(req.session.code){
              const code = req.session.code;
              getGoogleDriveDocFromCode(code, key.key, async (output) => {
                const baseDir = output.split('\t').pop();
                commitBuild(baseDir);
                res.redirect('codelabs');
            });            
            } else {
              //No code exists
              res.redirect('/');  
            }
          }
        } else if(!req.session.code) {
            //No code exists
            res.redirect('/');
        } else{
            // If there is no key, but a code exists load the success page
            res.sendFile(__dirname + '/views/success.html');
        }
      }
    );
};