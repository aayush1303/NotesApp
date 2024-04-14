const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const multer = require('multer');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());

const CONNECTION_URL = "mongodb+srv://your_username:your_password@cluster0.khhe5up.mongodb.net/";
const DATABASE_NAME = "notedb";
let database;

app.listen(3001, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.error('Error connecting to MongoDB:', error);
            return;
        }
        database = client.db(DATABASE_NAME);
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.use(express.json());

app.get('/api/notes/GetNotes', (request, response) => {
    const userEmail = request.query.email; // Retrieve email from query parameters

    // Assuming 'database' is your MongoDB connection
    database.collection("notescollection").find({ email: userEmail }).toArray((error, notes) => {
        if (error) {
            console.error('Error fetching notes:', error);
            response.status(500).send('Error fetching notes');
            return;
        }
        response.json(notes);
    });
});


app.post('/api/notes/AddNote', (request, response) => {
    const { heading, content, email } = request.body;
    // Assuming 'database' is your MongoDB connection
    
    // Include email in the inserted document
    database.collection("notescollection").insertOne({ heading, content, email }, (error, result) => {
        if (error) {
            console.error('Error adding note:', error);
            response.status(500).send('Error adding note');
            return;
        }
        console.log("Note added successfully");
        response.json("Note added successfully");
    });
});

app.delete('/api/notes/DeleteNote/:email/:id', (request, response) => {
    const userEmail = request.params.email;
    const id = request.params.id;
    database.collection("notescollection").findOneAndDelete({ _id: ObjectId(id), email: userEmail }, (error, result) => {
        if (error) {
            console.error('Error deleting note:', error);
            response.status(500).send('Error deleting note');
            return;
        }
        if (result.value) {
            console.log("Note deleted successfully");
            response.json("Note deleted successfully");
        } else {
            console.log("Note not found or unauthorized");
            response.status(404).send("Note not found or unauthorized");
        }
    });
});
app.put('/api/notes/UpdateNote/:id', (request, response) => {
    const id = request.params.id;
    const { content, heading } = request.body;

    database.collection("notescollection").updateOne(
        { _id: ObjectId(id) }, // Convert id to ObjectId
        { $set: { content: content, heading: heading } },
        (error, result) => {
            if (error) {
                console.error('Error updating note:', error);
                response.status(500).send('Error updating note');
                return;
            }
            console.log("Note updated successfully");
            response.json("Note updated successfully");
        }
    );
});

