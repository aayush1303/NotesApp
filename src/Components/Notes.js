import React,{useEffect,useState} from 'react';
import './Notes.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
const Notes = () => {
    
    //To add notes
    const[notes,setNotes]=useState([]);
    const[titles,setTitles] = useState([]);
    const[title,setTitle]=useState('');
    const[noteContent,setNote]=useState('');
    const [selectedNoteId, setSelectedNoteId] = useState(null);
      
    const email = localStorage.getItem('email');
    console.log(email);     
    const addNote = () => {
      setShowNote(!showNote);
      };
      
    
      useEffect(() => {
        // Fetch notes data from MongoDB when component mounts
        const userEmail = localStorage.getItem('email');
    
        axios.get(`http://localhost:3001/api/notes/GetNotes?email=${userEmail}`)
            .then(response => {
                // Assuming response.data is an array of notes objects
                const notesWithIds = response.data.map(note => ({
                    ...note,
                    id: note._id // Map MongoDB _id to id
                }));
                setNotes(notesWithIds); // Update state with fetched notes
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
            });
    }, []);
      
      useEffect(() => {
        console.log('Notes:', notes.map(note => ({ _id: note._id, heading: note.heading, content: note.content })));
    }, [notes]);



      //To save notes
      const saveNote = () => {
        // Retrieve email from localStorage
        const userEmail = localStorage.getItem('email');
    
        console.log("Before saving note - title:", title, "note:", noteContent);
        if (selectedNoteId) {
            // Update existing note
            const updatedNotes = notes.map(note =>
                note.id === selectedNoteId ? { ...note, content: noteContent, heading: title } : note
            );
    
            console.log("After updating notes:", updatedNotes);
    
            setNotes(updatedNotes);
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
            // Update the note in MongoDB
            const updatedNote = {
                _id: selectedNoteId,
                content: noteContent,
                heading: title
            };
            axios.put(`http://localhost:3001/api/notes/UpdateNote/${selectedNoteId}`, updatedNote)
                .then(response => {
                    console.log("Note updated successfully in MongoDB:", response.data);
                    // Show notification
                    alert('Note updated successfully');
                })
                .catch(error => {
                    console.error('Error updating note in MongoDB:', error);
                    // Handle error
                    alert('Failed to update note');
                });
        } else {
            // Save new note
            const id = notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1;
            const newNote = {
                id: id,
                content: noteContent,
                heading: title,
                email: userEmail // Include email in the new note object
            };
            const updatedNotes = [...notes, newNote];
            setNotes(updatedNotes);
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
            console.log("Sending new note to MongoDB:", newNote);
            // Send the updated notes to the MongoDB database
            axios.post('http://localhost:3001/api/notes/AddNote', newNote)
                .then(response => {
                    console.log("Note added successfully to MongoDB:", response.data);
                    // Show notification
                    alert('Note added successfully');
                })
                .catch(error => {
                    console.error('Error adding note to MongoDB:', error);
                    // Handle error
                    alert('Failed to add note');
                });
        }
    
        // Reset form and close note container
        setTitle('');
        setNote('');
        setSelectedNoteId(null); // Reset selected note ID
        setShowNote(false);
    };
    
      //To delete notes
      const deleteNote = (id) => {
        const userEmail = localStorage.getItem('email');
        const noteToDelete = notes.find(note => note._id === id && note.email === userEmail);
        if (noteToDelete) {
            axios.delete(`http://localhost:3001/api/notes/DeleteNote/${userEmail}/${id}`)
                .then(response => {
                    console.log("Note deleted successfully:", response.data);
                    alert("Note deleted successfully");
                    // Update state or perform any other necessary actions
                })
                .catch(error => {
                    console.error('Error deleting note:', error);
                    alert('Failed to delete note');
                });
        } else {
            alert("Note not found or unauthorized.");
        }
    };
      const truncateText = (text, limit) => {
        // Check if text is a string before attempting to split it
        if (typeof text !== 'string') {
          return '';
        }
      
        const words = text.split(' ');
        if (words.length > limit) {
          return words.slice(0, limit).join(' ') + '...';
        }
        return text;
      };

      const[showNote,setShowNote]=useState(false);
      const toggleNote=(note)=>{
        setShowNote(!showNote);
        setTitle(note.heading);
        setNote(note.content);
        setSelectedNoteId(note.id);
      }
      const closeNote=()=>{
         setShowNote(false);
      }

      const handleNoteClick = (id) => {
        setSelectedNoteId(id);
        // Revert border color after 10 seconds
        setTimeout(() => setSelectedNoteId(null), 10000);
    };

  return (
    <div>
    <div className="notes-container">
      <h1>Collections</h1>
      <div className="left-section">
         {notes.map((note) => (
           <div className={`title-container ${truncateText(note.heading, 15) ? '' : 'empty'}`} key={note.id} >
           {truncateText(note.heading, 15) && <p className='titles'>{truncateText(note.heading, 15)}</p>}
          </div>
        ))}
      </div>
      <button className='addsNote' onClick={addNote}>+</button>
      <div className="divider"></div>
      <h2>Notes</h2>
      <div className="right-section">
        {/* To make multiple notes*/ }
      {notes.map((note) => (
        <div className={`note-container ${truncateText(note.content, 32) ? '' : 'empty'}`} key={note.id} >
            {truncateText(note.content, 30) && (<p className='paragraph'>{truncateText(note.content, 30)}</p>)}
            <button className="close" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>X</button>
            <button className="pencil"onClick={()=>toggleNote(note)}><FontAwesomeIcon icon={faPencilAlt} /></button>
          </div>
        ))}
      </div>
    </div>
    {showNote && (
        <div className='noteContainer'>
          <input className='title' placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)}></input>
          <textarea className='note' placeholder='Write your note here' value={noteContent} onChange={(e) => setNote(e.target.value)} ></textarea>
          <div className='button-container'>
              <button className='save'onClick={saveNote}>Save</button>
              <button className='back'onClick={()=>closeNote()}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
