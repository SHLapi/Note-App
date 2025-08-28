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
const loginBtn = document.querySelector('.loginBtn');
const dialogCard = document.getElementById('dialogCard');

let Notes = [];
let editedNoteId = null;
let undoStack = [];
let redoStack = [];



const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};

const handleLoginState = () => {
  const token = localStorage.getItem('token');
  if (token) {
    loginBtn.innerHTML = '<i class="fa fa-sign-out"></i> LogOut';
    loginBtn.onclick = handleLogout;
    fetchNotes();
    const theme = localStorage.getItem('theme');
    if (theme) {
      applyTheme(theme);
    }
  } else {
    loginBtn.innerHTML = '<i class="fa fa-sign-in"></i> LogIn';
    loginBtn.onclick = () => window.location.href = '/login.html';
    Notes = [];
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
};

const saveNoteToServer = async (note) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to save your notes.');
    return;
  }

  try {
    const response = await fetch('/api/notes/save', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(note)
    });

    if (!response.ok) {
      throw new Error('Failed to save note.');
    }
    console.log('Note saved successfully!');
  } catch (err) {
    console.error(err);
    alert('An error occurred while saving the note.');
  }
};

const fetchNotes = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await fetch('/api/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      Notes = data.notes;
      generateNotes();
    }
} catch (err) {
    console.error('Error fetching notes:', err);
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
    alertDialog.showModal();
    Alert();
  });
}
const clearAllNotes = () => {
  localStorage.removeItem('Notes');
  Notes = [];
  if (alertDialog) {
    alertDialog.close();
  }
  saveState();
  generateNotes();
};

const applyTheme = (theme) => {
  document.body.className = theme === 'dark' ? 'darkTheme' : '';
  localStorage.setItem('theme', theme);
};
const saveThemeToServer = async (theme) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await fetch('http://localhost:5000/api/auth/theme', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
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



const openDialog = (noteId = null) => {
  if (noteId != null) {
    document.getElementById('dialogTitle').textContent = 'Edit Note';
    const editedNote = Notes.find(note => note.id == noteId);
    editedNoteId = noteId;
    titleInput.value = editedNote.title;
    contentInput.value = editedNote.content;
  } else {
    document.getElementById('dialogTitle').textContent = 'Add Note';
    editedNoteId = null;
    titleInput.value = '';
    contentInput.value = '';
    document.getElementById('alertTitleMsg').textContent = '';
    document.getElementById('alertContentMsg').textContent = '';
  }
  dialog.showModal();
};
const closeDialog = () => {
  dialog.close();
};

const noteId = () => {
  return Date.now().toString();
};
const saveNote = () => {
  if (isLoggedIn()) {
    saveNoteToServer({ notes: Notes });
  } else {
    localStorage.setItem('notes', JSON.stringify(Notes));
  }
};
const showCard = (noteId) => {
  const selectedNote = Notes.find(note => note.id == noteId);
  if (!selectedNote) return; 
  dialogCard.innerHTML = `
    <div class="dialogHeader">
      <h1 id="dialogTitle">${selectedNote.title}</h1>
      <button type="button" class="closeDialogBtn" onclick="dialogCard.close()"><i class="fa fa-times"></i></button>
    </div>
    <p class="selectedNoteContent">${selectedNote.content}</p>
  `;
  dialogCard.showModal();
};
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
          <button type="button" class="removeNote"><i class="fa-solid fa-trash"></i></button>
      </div>
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
const removeNote = (noteId) => {
  Notes = Notes.filter(note => note.id != noteId);
  saveNote();
  generateNotes();
  saveState();
};
addNoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const Title = titleInput.value.trim();
  const Content = contentInput.value;
  const alertTitleMsg = document.getElementById('alertTitleMsg');
  const alertContentMsg = document.getElementById('alertContentMsg');

  if (Title === '') {
      return (alertTitleMsg.textContent = 'Please Add your Note Title!');
  }
  if (Content === '') {
      return (alertContentMsg.textContent = 'Please Add Content to your note!');
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
    Notes.push({
      id: noteId(),
      title: Title,
      content: Content,
    });
  }

  saveNote();
  closeDialog();
  generateNotes();
});
const loadNotes = () => {
  if (!isLoggedIn()) {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      Notes = JSON.parse(savedNotes);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  generateNotes();
  updateUndoRedoBtns();
  handleLoginState();
});