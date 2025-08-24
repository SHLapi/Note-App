const dialog = document.getElementById('noteDialog');
const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const themeBtn = document.getElementById('themeToggleBtn');
const addNoteForm = document.getElementById('noteForm');
const noteContainer = document.getElementById('notesGrid')

let Notes = [];

const generateNotes = ()=>  {
  noteContainer.innerHTML = Notes.map(note => `
    <div class="noteCard">
      <h4 class="noteTitle">${note.title}</h4>
      <p class="noteContent">${note.content}</p>
      <div class="noteActions">
        <button type="button" class="editBtn" onclick="clearAllBtn()"><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button type="button" class="removeNote" onclick="removeNote(${note.id})" ><i class="fa fa-trash" aria-hidden="true"></i></button>
      </div>
    </div>
    `).join(``)
    const addNoteBtns = document.createElement('button')
    addNoteBtns.className = 'addNoteBtn Js'
    addNoteBtns.textContent = '+ Add Another Note'
    addNoteBtns.onclick = () => openDialog()
    noteContainer.appendChild(addNoteBtns)
}
const removeNote = (noteId) => {
  Notes = Notes.filter(note => note.id != noteId) 
  saveNote();
  generateNotes();
}
const clearAllBtn = () => {

}
// function to open and close Dialog
const openDialog = () => {
  dialog.showModal()
}
const closeDialog = () => {
  dialog.close();
}
themeBtn.addEventListener('click', () => {
  const dark = document.body.classList.toggle('darkTheme');
  localStorage.setItem('Theme', dark? 'dark' : 'light');
})

// Change theme and save it
const applyTheme = ()=>{
  if (localStorage.getItem('Theme') === 'dark'){
    document.body.classList.toggle('darkTheme');
  } 
}

//make an id to each note
const noteId = ()=>{
  return Date.now().toString();
}
const saveNote = () => {
  localStorage.setItem('Notes', JSON.stringify(Notes));
}
addNoteForm.addEventListener('submit', (e) =>{
  e.preventDefault();
  const Title = titleInput.value.trim();
  const Content = contentInput.value.trim();
  if ( Title === '' || Content === ''){
    return closeDialog();
  }
  Notes.push({
    id: noteId(),
    title: Title,
    content: Content
  })
  saveNote()
  closeDialog();
  generateNotes()
})
const loadNotes = () => {
  const savedNotes = localStorage.getItem('Notes')
  return savedNotes? JSON.parse(savedNotes):[];
}

document.addEventListener('DOMContentLoaded', ()=> {
  applyTheme();
  Notes = loadNotes();
  generateNotes();
})