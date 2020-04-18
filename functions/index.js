const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const serviceAccount = require('./ServiceAccountKey.json');

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

app.get('/info', (request, response) =>
{
    var data = JSON.parse(fs.readFileSync('data.json'));
    response.send(data);
})

app.get('/usage', (request,response) =>
{
    var counter = 0;
    var data = [];
    var email = request.query.email;

    db.collection('Users').get()
    .then(snapshot => 
        {
            snapshot.forEach(doc => 
            {
                if(doc.id == email)
                {
                    db.collection('Users').doc(doc.id).collection('Usage').get()
                    .then(snapshot =>
                        {
                            snapshot.forEach(doc =>
                                {
                                    if(snapshot["_size"] == 0)
                                    {
                                        response.send("409");
                                    }
                                    else
                                    {
                                        counter++;
                                        data.push({data:doc.data(), id:doc.id});
        
                                        if(counter == snapshot["_size"])
                                        {
                                            response.send(data);
                                        }
                                    }
                                })
                        })
                }
            })
        })
})

app.get('/getSubstances', (request, response) =>
{
    var counter = 0;
    var substances = [];

    db.collection('Substances').get()
    .then(snapshot =>
        {
            snapshot.forEach(doc =>
                {
                    if(snapshot["_size"] == 0)
                    {
                        response.send("500");
                    }
                    else
                    {
                        counter++;
                        substances.push(doc.id);

                        if(counter == snapshot["_size"])
                        {
                            console.log(substances);
                            response.send(substances);
                        }
                    }
                })
        })
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
                    response.send(doc.data()["username"]);
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

app.post('/addDose', (request, response) =>
{
    var data = request.body;
    var fields;

    if(data["data"].length == 3)
    {
        fields =
        {
            mood: data["data"][0],
            substance: data["data"][1],
            dosage: "Unknown",
            scale: "Unknown"
        }
    }
    else
    {
        fields =
        {
            mood: data["data"][0],
            substance: data["data"][1],
            dosage: data["data"][2],
            scale: data["data"][3]
        }
    }

    db.collection('Users').doc(data["email"]).collection('Usage').doc(data["timestamp"]).set(fields).then(() =>
    {
        response.send("200");
    })
})

//Export app
exports.app = functions.https.onRequest(app);