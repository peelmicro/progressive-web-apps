const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwagram-2448f-firebase-adminsdk-htokh-be82ceee95.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-2448f.firebaseio.com/'
});


exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, function() {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
    .then(function () {
      webpush.setVapidDetails('mailto:peelmicro@gmail.com', 
        'BNGt2PqcrLboRIyAVqtUbzZtsJkmYXRBgJKEvaABQvjSTyJDZfl0eV9b0N4sb7xAlU5n3v3HgM_S-EXfagqQ1hU', 
        'fR9z2qFyPEIg7Eikq_T1b4R_y4534yhV6Xr98zEF448');
      return admin.database().ref('subscriptions').once('value');
    })
    .then(function (subscriptions) {
      subscriptions.forEach(function (sub) {
        var pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };

        webpush.sendNotification(pushConfig, JSON.stringify({
          title: 'New Post',
          content: 'New Post added!',
          openUrl: '/help'
        }))
          .catch(function (err) {
            console.log(err);
          })
      });
      response.status(201).json({message: 'Data stored', id: request.body.id});
    })
    .catch(function (err) {
      response.status(500).json({error: err});
    });
  });
});
