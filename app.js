const dialog = document.getElementById('noteDialog');
const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const themeBtn = document.getElementById('themeToggleBtn');
const addNoteForm = document.getElementById('noteForm');
const noteContainer = document.getElementById('notesGrid')
//initialing Note value
let Notes = [];
let editedNoteId = null ;

//function to Generate Notes Cards
const generateNotes = ()=>  {
  noteContainer.innerHTML = Notes.map(note => `
    <div class="noteCard">
      <h4 class="noteTitle">${note.title}</h4>
      <p class="noteContent">${note.content}</p>
      <div class="noteActions">
        <button type="button" class="editBtn" onclick="openDialog(${note.id})"><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button type="button" class="removeNote" onclick="removeNote(${note.id})" ><i class="fa fa-trash" aria-hidden="true"></i></button>
      </div>
    </div>
    `).join(``)
    //adding button to create new note
    const addNoteBtns = document.createElement('button')
    addNoteBtns.className = 'addNoteBtn'
    addNoteBtns.textContent = Notes.length === 0? '+ Add Note' : '+ Add New Note'
    addNoteBtns.onclick = () => openDialog()
    noteContainer.appendChild(addNoteBtns)
}
//remove note Function handled by delete button on note card
const removeNote = (noteId) => {
  Notes = Notes.filter(note => note.id != noteId) 
  saveNote();
  generateNotes();
}

//Function to delete all note
const clearAllNotes = () => {
  localStorage.removeItem('Notes');
  Notes = [];
  generateNotes();
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

//make an id to each note
const noteId = ()=>{
  return Date.now().toString();
}
//store notes in local Storage
const saveNote = () => {
  localStorage.setItem('Notes', JSON.stringify(Notes));
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
  }
  dialog.showModal()
}
//Function to Close dialog
const closeDialog = () => {
  dialog.close();
}
//Event to submit note form
addNoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const Title = titleInput.value.trim();
  const Content = contentInput.value.trim();
  if ( Title === '' || Content === ''){
    return closeDialog();
  }
  else if (editedNoteId){
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
}

//Event apply when page is reloaded
document.addEventListener('DOMContentLoaded', ()=> {
  applyTheme();
  Notes = loadNotes();
  generateNotes();
})