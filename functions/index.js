var functions = require('firebase-functions');
var admin = require('firebase-admin');
var express = require('express');
var engines = require('consolidate');
var bcrypt = require('bcryptjs');
var serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp
({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

//Set engine as pug
app.engine('pug', engines.pug);
//Set view folder location
app.set('views', './views');
//Use new engine
app.set('view engine', 'pug');

//Homepage
app.get('/', (request, response) =>
{
    //Cache request for faster access
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    //Render page
    response.render('index');
})

//Homepage
app.get('/home', (request, response) =>
{
    //Cache request for faster access
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    //Render page
    response.render('home');
})

app.post('/register', (request, response) =>
{
    var data = request.body.data;
    var emailAvailable = true;
    var counter = 0;

    db.collection('Users').get()
    .then(snapshot => 
    {
        snapshot.forEach(doc => 
        {
            if(doc.id == data.email)
            {
                console.log("Same email");
                emailAvailable = false;
            }
            counter++;
            if(counter == snapshot["_size"])
            {
                bcrypt.genSalt(10, function(err, salt)
                {
                    bcrypt.hash(data["password"], salt, function(err, hash) 
                    {
                        var fields = 
                        {
                            username: data.name,
                            password: hash
                        }
                        if(emailAvailable)
                        {
                            db.collection('Users').doc(data.email).set(fields).then(() =>
                            {
                                console.log("Account created");
                                response.send("200");
                            })
                        }
                        else
                        {
                            console.log("Email in use");
                            response.send("409");
                        }
                    });
                });
            }
        })
    })
    .catch(err => 
    {
      console.log('Error getting documents', err);
      response.send("500");
    });
})

app.post('/login', (request, response) =>
{
    var data = request.body.data;
    
    db.collection('Users').doc(data.email).get()
    .then(function(doc) 
    {
        if (doc.exists) 
        {
            bcrypt.compare(data.password, doc.data()["password"], function(err, res) 
            {
                if(res == true)
                {
                    console.log("Logged in");
                    response.render('home', {email: data.email});
                }
                else
                {
                    console.log("Wrong email/password");
                    response.send("409");
                }
            });
        } 
        else 
        {
            console.log("No such document!");
            response.send("500");
        }
    })
})

//Export app
exports.app = functions.https.onRequest(app);
