const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const database = admin.database().ref('/items');

//Hello world show function
exports.helloWorld = functions.https.onRequest((req, res) => 
    {
    res.send("Hello from a Severless Database!");
    });

//Function from returning data from DB
const getItemsFromDatabase = (res) => 
{
    let items = [];

    return database.on('value', (snapshot) => 
    {
      snapshot.forEach((item) => 
      {
        items.push({
          id: item.key,
          items: item.val().item 
        });
      });   
      res.status(200).json(items);
    }, (error) => 
    {
      res.status(error.code).json(
        {
            message: `Something went wrong. ${error.message}`
        })
    })
};

//AddItem POST function
exports.addItem = functions.https.onRequest((req, res) => 
{
  return cors(req, res, () => 
  {
    if(req.method !== 'POST') 
    {
      return res.status(401).json(
        {
            message: 'Not allowed'
        })
    };
    console.log(req.body);
  
    const item = req.body.item;

    database.push({ item });
    getItemsFromDatabase(res);
  });
});

//getItem GET function
exports.getItems = functions.https.onRequest((req, res) => {
  return cors(req, res, ()=> {
    if(req.method!=='GET')
    {
      return res.status(401).json({
        message: "Not Allowed"
      });
    };
    getItemsFromDatabase(res);
  });
});

//delete DELETE function
exports.delete = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method!=='DELETE')
    {
      return res.status(401).json({
        message: "Not Allowed"
      })
    }
    const id = req.query.id;
    admin.database().ref(`/items/${id}`).remove();
    getItemsFromDatabase(res);
  })
});