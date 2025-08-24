const dialog = document.getElementById('noteDialog');
const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const themeBtn = document.querySelector('themeToggleBtn');
const addNoteForm = document.getElementById('noteForm');
const noteContainer = document.getElementById('noteGrid')

let Notes = [];

// function to open and close Dialog
const openDialog = () => {
  dialog.showModal()
}
const closeDialog = () => {
  dialog.close();
}

// Change theme and save it
const Theme = () =>{
  const dark = document.body.classList.toggle('darkTheme');
  localStorage.setItem('Theme', dark? 'dark' : 'light');
}
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
    content: Content,
  })
  saveNote()
  closeDialog();
})


document.addEventListener('DOMContentLoaded', ()=> {
  applyTheme();
})