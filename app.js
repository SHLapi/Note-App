const dialog = document.getElementById('noteDialog');
const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const themeBtn = document.getElementById('themeToggleBtn');
const addNoteForm = document.getElementById('noteForm');
const noteContainer = document.getElementById('notesGrid');
const alertDialog = document.getElementById('alertDialog');
const clearAllBtn = document.getElementById('clearAllBtn');
const undoBtn = document.querySelector('.undoBtn');
const redoBtn = document.querySelector('.redoBtn');


//initialing Note value
let Notes = [];
let editedNoteId = null ;
let undoStack = [];
let redoStack = [];


const saveState = () => {
    // Only save state if the Notes array has actually changed
    const currentState = JSON.stringify(Notes);
    if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
        undoStack.push(currentState);
        redoStack = []; // Clear redo stack on a new action
        updateUndoRedoBtns();
    }
};

// Function to update the buttons' disabled state
const updateUndoRedoBtns = () => {
    if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
};

// Undo function
const undo = () => {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        Notes = JSON.parse(undoStack[undoStack.length - 1]);
        saveNote();
        generateNotes();
        updateUndoRedoBtns();
    }
};

// Redo function
const redo = () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        Notes = JSON.parse(undoStack[undoStack.length - 1]);
        saveNote();
        generateNotes();
        updateUndoRedoBtns();
    }
};

// Event listeners for undo/redo buttons
if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);

//Event for Clear All Notes Button
clearAllBtn.addEventListener('click', () => {
  const Alert = () => {
  if (Notes.length === 0){
    alertDialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3> Nothing there to Clear 👀</h3>
      <button type="button" class="AlertCancelBtn" onclick="{alertDialog.close()}">I Know</button>
    </div>
    `
    
  }else{
  alertDialog.innerHTML = `
  <h3>Are you sure you want to <span>Delete All</span> your Notes?</h3>
  <div class="dialogAction">
    <button 
      type="button" 
      class="AlertCancelBtn" 
      onclick="{alertDialog.close()}"
      >
        Cancel
    </button>
    <button type="submit" class="cancelBtn" onclick="clearAllNotes()" >Yes</button>
  </div>
  `}
}
  alertDialog.showModal();
  Alert()

})
//Function to delete all note
const clearAllNotes = () => {
  localStorage.removeItem('Notes');
  Notes = [];
  if (alertDialog) {
    alertDialog.close();
  }
  generateNotes();
  saveState();
}

//Handle theme button to change theme (Dark or Light)
themeBtn.addEventListener('click', () => {
  const dark = document.body.classList.toggle('darkTheme');
  localStorage.setItem('Theme', dark? 'dark' : 'light');
})
//Save the Theme
const applyTheme = ()=>{
  if (localStorage.getItem('Theme') === 'dark'){
    document.body.classList.toggle('darkTheme');
  } 
}

//Function to Open Dialog (Add new mode & Edit mode)
const openDialog = (noteId = null) => {
  if (noteId != null){
    document.getElementById('dialogTitle').textContent = 'Edit Note';
    const editedNote = Notes.find( note => note.id == noteId);
    editedNoteId = noteId;
    titleInput.value = editedNote.title;
    contentInput.value = editedNote.content;
  }else{
    document.getElementById('dialogTitle').textContent = 'Add Note';
    editedNoteId = null;
    titleInput.value = '';  
    contentInput.value = '';
    alertTitleMsg.textContent = '';
    alertContentMsg.textContent = '';
  }
  dialog.showModal()
}
//Function to Close dialog
const closeDialog = () => {
  dialog.close();
}

//make an id to each note
const noteId = ()=>{
  return Date.now().toString();
}
//store notes in local Storage
const saveNote = () => {
  localStorage.setItem('Notes', JSON.stringify(Notes));
  saveState();
}
//function to open selected Note
const showCard = (noteId) => {
  const selectedNote = Notes.find(note => note.id == noteId);
  const dialogCard = document.getElementById('dialogCard');
  dialogCard.innerHTML = `
  <div class="dialogHeader">
    <h1 id="dialogTitle">${selectedNote.title}</h1>
    <button type="button" class="closeDialogBtn" onclick={dialogCard.close()}><i class="fa fa-times"></i></button>
  </div>
  <p class="selectedNoteContent">
  ${selectedNote.content}
  </p>
  `
  dialog.addEventListener('click', function(e) {
    if(e.target === this) {
      dialogCard.close()
    }
  })
  
  dialogCard.showModal()
} 
//function to Generate Notes Cards
const generateNotes = () => {
  noteContainer.innerHTML = '';
  Notes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.className = 'noteCard';
    noteCard.innerHTML = `
      <h4 class="noteTitle">${note.title}</h4>
      <p class="noteContent">${note.content}</p>
      <div class="noteActions">
        <button type="button" class="editBtn"><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button type="button" class="removeNote"><i class="fa fa-trash" aria-hidden="true"></i></button>
      </div>
    `;

    // Add a click listener to the entire card
    noteCard.addEventListener('click', (e) => {
      if (e.target.closest('.editBtn') || e.target.closest('.removeNote')) {
        return;
      }
      showCard(note.id);
    });

    noteCard.querySelector('.editBtn').addEventListener('click', () => openDialog(note.id));
    noteCard.querySelector('.removeNote').addEventListener('click', () => removeNote(note.id));

    noteContainer.appendChild(noteCard);
  });
  const addNoteBtns = document.createElement('button')
  addNoteBtns.className = 'addNoteBtn floating-btn'
  addNoteBtns.textContent = Notes.length == 0? '+ Add Note':'+ Add New Note'
  addNoteBtns.onclick = () => openDialog()
  noteContainer.appendChild(addNoteBtns)
  saveState();
};

//remove note Function handled by delete button on note card
const removeNote = (noteId) => {
  Notes = Notes.filter(note => note.id != noteId) 
  saveNote();
  generateNotes();
  saveState();
}
//Event to submit note form
addNoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const Title = titleInput.value.trim();
  const Content = contentInput.value.trim();
  const alertTitleMsg = document.getElementById('alertTitleMsg')
  const alertContentMsg = document.getElementById('alertContentMsg')
  
  if (Title === ''){
    return (alertTitleMsg.textContent = 'Please Add your Note Title!'
    );
  }
  if (Content === ''){
    return alertContentMsg.textContent = 'Please Add Content to your note!' ;
  }
  saveState();
  if (editedNoteId){
    const noteIndex = Notes.findIndex(note => note.id == editedNoteId)
    Notes[noteIndex] = {
      ...Notes[noteIndex],
      title: Title,
      content : Content,
    }
  }else
    Notes.push({
    id: noteId(),
    title: Title,
    content: Content,
  })
  
  saveNote()
  closeDialog();
  generateNotes()
})
//load Notes stored
const loadNotes = () => {
  const savedNotes = localStorage.getItem('Notes')
  return savedNotes? JSON.parse(savedNotes):[];
  saveState();
}

//Event apply when page is reloaded
document.addEventListener('DOMContentLoaded', ()=> {
  applyTheme();
  Notes = loadNotes();
  generateNotes();
  updateUndoRedoBtns();
})