const dialog = document.getElementById('noteDialog');
const titleInput = document.getElementById('noteTitle');
const themeBtn = document.getElementById('themeToggleBtn');
const addNoteForm = document.getElementById('noteForm');
const noteContainer = document.getElementById('notesGrid');
const alertDialog = document.getElementById('alertDialog');
const clearAllBtn = document.getElementById('clearAllBtn');
const undoBtn = document.querySelector('.undoBtn');
const redoBtn = document.querySelector('.redoBtn');
const loginBtn = document.querySelector('.loginBtn');
const dialogCard = document.getElementById('dialogCard');
const API_URL = 'http://localhost:5000';
let Notes = [];
let editedNoteId = null;
let undoStack = [];
let redoStack = [];
let isLoggedIn = false;
let quill; 
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'header': 1 }, { 'header': 2 }],             
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'super' }],
  // [{ 'indent': '-1'}, { 'indent': '+1' }],   
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }], 
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['clean']                                        
];

const loadQuill = () => {
  quill = new Quill('#noteContent', {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions,
    },
    placeholder: 'Write your note content here...',
    });
};

document.addEventListener('DOMContentLoaded', () => {
  loadQuill();
  loadNotes();
  generateNotes();
  updateUndoRedoBtns();
  handleLoginState();
});

const syncNotes = async () => {
  const token = localStorage.getItem('token');
  if (!token) {return}
  try {
    const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
    const response = await fetch(`${API_URL}/api/notes/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch notes.');
    }

    const data = await response.json();
    const serverNotes = data.notes;

    const mergedNotes = [...serverNotes];
    
    
    for (const localNote of localNotes) {
      if (!mergedNotes.some(serverNote => serverNote.id === localNote.id)) {
        mergedNotes.push(localNote);
      }
    }
    Notes = mergedNotes;
    await saveNoteToServer(Notes);
    localStorage.removeItem('notes');
    generateNotes();
  } catch (error) {
    console.error('Error syncing notes:', error);
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      alert('Session expired. Please log in again.');
      window.location.href = '/login.html';
    }
  }
};


const handleLoginState = () => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn = true;
    loginBtn.innerHTML = '<span style="color:#f76f73"><i class="fa-solid fa-door-open"></i></span>';
    loginBtn.onclick = handleLogout;
    syncNotes();
    undoStack = [];
    redoStack = [];
    const theme = localStorage.getItem('theme');
    if (theme) {
      applyTheme(theme);
    }
  } else {
    isLoggedIn = false;
    loginBtn.innerHTML = '<i class="fa fa-sign-in"></i> LogIn';
    loginBtn.onclick = () => window.location.href = '/login.html';
    loadNotes();
    generateNotes();
    const theme = localStorage.getItem('theme');
    if (theme) {
      applyTheme(theme);
    } else {
      applyTheme('light');
    }
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  alert('Logged out successfully!');
  handleLoginState();
  isLoggedIn = false;
  Notes = [];
  undoStack = [];
  redoStack = [];
  generateNotes();
  handleLoginState();
  window.location.reload();
};


const saveNoteToServer = async (notes) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/api/notes/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) {
      throw new Error('Failed to save notes.');
    }
    console.log('Notes saved successfully!');
    // Corrected line: only remove the 'notes' from local storage
    localStorage.removeItem('notes');
  } catch (err) {
    console.error('Error saving notes:', err);
    // Handle specific errors like 401 Unauthorized
    if (err.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      alert('Session expired. Please log in again.');
      window.location.href = '/login.html';
    } else {
      alert('An error occurred while saving the note.');
    }
  }
};
const saveNote = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.setItem('notes', JSON.stringify(Notes))
  }else{saveNoteToServer(Notes);}
  
};
const fetchNotes = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found. Please log in.");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/notes/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again. Or Check token');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch notes.');
    }

    const data = await response.json();
    Notes = data.notes;
    generateNotes();
  } catch (error) {
    console.error('Error fetching notes:', error);
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
    }
  }
};

const loadNotes = () => {
  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    Notes = JSON.parse(savedNotes);
  }
};


const saveState = () => {
  const currentState = JSON.stringify(Notes);
  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
    undoStack.push(currentState);
    redoStack = [];
    updateUndoRedoBtns();
  }
};
const updateUndoRedoBtns = () => {
    if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
};
const undo = () => {
  if (undoStack.length > 1) {
    const lastState = undoStack.pop();
      redoStack.push(lastState);
      Notes = JSON.parse(undoStack[undoStack.length - 1]);
      saveNote();
      generateNotes();
      updateUndoRedoBtns();
  } 
};
const redo = () => {
  if (redoStack.length > 0) {
    const redoState = redoStack.pop();
    undoStack.push(redoState);
    Notes = JSON.parse(redoState);
    saveNote();
    generateNotes();
    updateUndoRedoBtns();
  }
};
if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);


const clearAllNotes = () => {
  localStorage.removeItem('notes');
  Notes = [];
  if (alertDialog) {
    alertDialog.close();
  }
  saveState();
  generateNotes();
};
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    const Alert = () => {
      if (Notes.length === 0) {
        alertDialog.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3>Nothing there to Clear 👀</h3>
              <button type="button" class="AlertCancelBtn" onclick="alertDialog.close()">I Know</button>
          </div>
        `;
      } else {
        alertDialog.innerHTML = `
          <h3>Are you sure you want to <span style="color:red">Delete All</span> your Notes?</h3>
          <div class="dialogAction">
              <button type="button" class="AlertCancelBtn" onclick="alertDialog.close()">Cancel</button>
              <button type="button" class="cancelBtn" onclick="clearAllNotes()">Yes</button>
          </div>
        `;
      }
    };
    alertDialog.show();
    Alert();
  });
}


const applyTheme = (theme) => {
  document.body.className = theme === 'dark' ? 'darkTheme' : '';
  localStorage.setItem('theme', theme);
};

const saveThemeToServer = async (theme) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await fetch(`${API_URL}/api/auth/theme1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ theme })
    });
  } catch (err) {
    console.error('Error saving theme:', err);
  }
};

const handleThemeToggle = () => {
  const currentTheme = document.body.className === 'darkTheme' ? 'light' : 'dark';
  applyTheme(currentTheme);
  saveThemeToServer(currentTheme);
}
if (themeBtn) {
  themeBtn.addEventListener('click', handleThemeToggle);
}


const noteId = () => {
  return Date.now().toString();
};


const openDialog = (noteId = null) => {
  if (noteId != null) {
    document.getElementById('dialogTitle').textContent = 'Edit Note';
    const editedNote = Notes.find(note => note.id == noteId);
    editedNoteId = noteId;
    titleInput.value = editedNote.title;
    quill.root.innerHTML = editedNote.content;
  } else {
    document.getElementById('dialogTitle').textContent = 'Add Note';
    editedNoteId = null;
    titleInput.value = '';
    quill.root.innerHTML = '';
    document.getElementById('alertTitleMsg').textContent = '';
    document.getElementById('alertContentMsg').textContent = '';
  }
  dialog.showModal();
};
const closeDialog = () => {
  dialog.close();
};


const showCard = (noteId) => {
  const selectedNote = Notes.find(note => note.id == noteId);
  if (!selectedNote) return; 
  dialogCard.innerHTML = `
  <div class="dialogHeader">
    <h3 id="dialogTitle">${selectedNote.title}</h3>
    <button type="button" class="closeDialogBtn" onclick="dialogCard.close()"><i class="fa fa-times"></i></button>
    </div>
    <p class="noteCreatedDialog" >${selectedNote.created}</p>
  <hr/>
    <div class="selectedNoteContent">${selectedNote.content}</div>
  `
  dialogCard.showModal();
};
const removeNote = (noteId) => {
  Notes = Notes.filter(note => note.id != noteId);
  saveNote();
  generateNotes();
  saveState();
};
const generateNotes = () => {
  noteContainer.innerHTML = '';
  Notes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.className = 'noteCard';
    noteCard.innerHTML = `
      <h4 class="noteTitle">${note.title}</h4>
      <div class="noteActions">
          <button type="button" class="editBtn"><i class="fa fa-pencil" aria-hidden="true"></i></button>
          <button type="button" class="removeNote"><i class="fa-solid fa-trash"></i></button>
      </div>
      <p class="noteCreated">${note.created}</p>
    `;
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
  const addNoteBtns = document.createElement('button');
  addNoteBtns.className = 'addNoteBtn floating-btn';
  addNoteBtns.textContent = Notes.length === 0 ? '+ Add Note' : '+ Add New Note';
  addNoteBtns.onclick = () => openDialog(); 
  noteContainer.appendChild(addNoteBtns); 
  saveState();
};
addNoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const Title = titleInput.value.trim();
  const Content = quill.root.innerHTML;
  const alertTitleMsg = document.getElementById('alertTitleMsg');
  const alertContentMsg = document.getElementById('alertContentMsg');
  alertContentMsg.textContent = '';
  alertTitleMsg.textContent = '';
  if (Title == '' ) {
    return (alertTitleMsg.textContent = 'Please add a title to your note!');
  }
  if (Content == '<p><br></p>' || Content.trim() === '') {
    return (alertContentMsg.textContent = 'Please add a content to your note!');
  }
  saveState();
  if (editedNoteId) {
    const noteIndex = Notes.findIndex(note => note.id == editedNoteId);
    Notes[noteIndex] = {
      ...Notes[noteIndex],
      title: Title,
      content: Content,
    };
  } else {
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    Notes.push({
      id: noteId(),
      title: Title,
      content: Content,
      created: `${date} - ${time}`,
    });
  }

  saveNote();
  closeDialog();
  generateNotes();
});


