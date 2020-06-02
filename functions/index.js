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

//Retrieve substance data
app.get('/getSubstanceData', (request, response) =>
{
    var data = JSON.parse(fs.readFileSync('substances.json'));
    response.send(data);
})

//Retrieve substance usage from a user
app.get('/getSubstanceUsage', (request, response) =>
{
    var email = request.query.email;

    var substanceUse = {};
    var substancesNumber = 0;
    var substancesNumberCounter = 0;
    var numberEntries = 0;
    var counter = 0;

    //Loop through database usage of the user
    db.collection('Users').doc(email).collection('Usage').get()
    .then(snapshot =>
    {
        if(snapshot["_size"] > 0)
        {
            substancesNumber = snapshot["_size"];

            //Loop through each substance
            snapshot.forEach(doc =>
            {
                var substance = doc.id;
                substanceUse[substance] = [];

                db.collection('Users').doc(email).collection('Usage').doc(doc.id).collection('Entries').get()
                .then(snapshot =>
                {
                    if(snapshot["_size"] > 0)
                    {
                        numberEntries += snapshot["_size"];

                        //Loop through each entry
                        snapshot.forEach(doc =>
                        {
                            data = doc.data();
                            data["id"] = doc.id;

                            substanceUse[substance].push(data);

                            counter++;
                            if(counter >= numberEntries)
                            {
                                substancesNumberCounter++;
                                if(substancesNumberCounter == substancesNumber)
                                {
                                    response.send({"code": "200", "data": substanceUse});
                                }
                            }
                        })
                    }
                })
                .catch(err =>
                {
                    response.send({"code": "204"});
                })
            })
        }
        else
        {
            response.send({"code": "204"});
        }
    })
    .catch(err =>
    {
        response.send({"code": "204"});
    })
})

//Register user
app.post('/register', (request, response) =>
{
    var data = request.body.data;
    var emailAvailable = true;
    var counter = 0;

    db.collection('Users').get()
    .then(snapshot => 
    {
        //Check if email isnt taken
        snapshot.forEach(doc => 
        {
            if(doc.id == data.email)
            {
                emailAvailable = false;
            }

            counter++;

            if(counter == snapshot["_size"])
            {
                //Encrypt password
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
                            //Create account
                            db.collection('Users').doc(data.email).set(fields).then(() =>
                            {
                                response.send("200");
                            })
                        }
                        else
                        {
                            //Email in use
                            response.send("409");
                        }
                    });
                });
            }
        })
    })
    .catch(err => 
    {
        response.send("500");
    });
})

//Log in users
app.post('/login', (request, response) =>
{
    var data = request.body.data;
    
    //Get user data
    db.collection('Users').doc(data.email).get()
    .then(function(doc) 
    {
        if (doc.exists) 
        {
            //Check for user
            bcrypt.compare(data.password, doc.data()["password"], function(err, res) 
            {
                if(res == true)
                {
                    //Log in user
                    response.send(doc.data()["username"]);
                }
                else
                {
                    //Wrong password
                    response.send("409");
                }
            });
        } 
        else 
        {
            //Wrong email
            response.send("409");
        }
    })
})

//Add dose to database
app.post('/addDose', (request, response) =>
{
    var data = request.body;

    var fields = 
    {
        dosage: data["data"][1],
        moods: data["data"][3],
        timestamp: data["data"][2]
    }

    var substanceName =
    {
        name: data["data"][0]
    }

    //Add dose to entries and inside it's respective group
    db.collection('Users').doc(data["email"]).collection('Usage').doc(data["data"][0]).set(substanceName)
        .then(doc =>
        {
            db.collection('Users').doc(data["email"]).collection('Usage').doc(data["data"][0]).collection('Entries').add(fields)
            .then(doc =>
            {
                response.send("200");
            }) 
            .catch(() =>
            {
                response.send("500");
            })
        })
        .catch(() =>
        {
            response.send("500");
        })
})

//Update field of an entry
app.post('/updateField', (request, response) =>
{
    var data = request.body;

    if(data["field"] == "Timestamp")
    {
        db.collection('Users').doc(data["email"]).collection('Usage').doc(data["substance"]).collection('Entries').doc(data["id"]).update({timestamp: data["data"]})
    }
    else if(data["field"] == "Dosage")
    {
        db.collection('Users').doc(data["email"]).collection('Usage').doc(data["substance"]).collection('Entries').doc(data["id"]).update({dosage: data["data"]})
    }
    else if(data["field"] == "Cost")
    {
        db.collection('Users').doc(data["email"]).collection('Usage').doc(data["substance"]).collection('Entries').doc(data["id"]).update({cost: data["data"]})
    }
    else if(data["field"] == "Moods")
    {
        db.collection('Users').doc(data["email"]).collection('Usage').doc(data["substance"]).collection('Entries').doc(data["id"]).update({moods: data["data"]})
    }

    response.send({code: "200"});
})

//Export app
exports.app = functions.https.onRequest(app);