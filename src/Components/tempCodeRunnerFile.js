app.delete('/api/notes/DeleteNote/:id', (request, response) => {
    const id = request.params.id;
    database.collection("notescollection").deleteOne({ _id: ObjectId(id) }, (error, result) => {
        if (error) {
            console.error('Error deleting note:', error);
            response.status(500).send('Error deleting note');
            return;
        }
        console.log("Note deleted successfully");
        response.json("Note deleted successfully");
    });
});