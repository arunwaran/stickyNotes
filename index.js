const electron = require('electron');
const remote = electron.remote;
const fs = require('fs');
const { trace } = require('console');

const notesConfigPath = 'notes/config.json';
const notesFilePath = 'notes/notes.json';

// reset the index to 1 in config.json
module.exports = function onClose(){
    let configData = {'index':1};
    configData = JSON.stringify(configData);
    fs.writeFileSync(notesConfigPath,configData);
}

// initiate on body load 
function onStartUp(){
    checkIfFirstNote();
}

function checkIfFirstNote(){
    let notes = getNotes();
    if (notes.length > 1){
        loadNotes();
    }
    else{
        setNoteID(1);
        //pass 0 to add new note to notes.json but not to create new window
        addNewNote(0);
        updateIndex(2);
    }
}

function loadNotes(){
    try{
        let currentIndex = getIndex();
        let notes = getNotes();
        updateIndex(currentIndex+1);

        if(currentIndex < notes.length){

            //load note from array at index postion = currentIndex
            let noteId = notes[currentIndex].id;
            let noteContent = notes[currentIndex].content;
            let windowWidth = notes[currentIndex].windowWidth;
            let windowHeight = notes[currentIndex].windowHeight;
            let winPositionX = notes[currentIndex].windowPositionX;
            let winPositionY = notes[currentIndex].windowPositionY;
            
            setNoteID(noteId);
            setNoteContent(noteContent);
            setWindowSize(windowWidth,windowHeight);
            setWindowPosition(winPositionX,winPositionY);

            // last note should not add new window
            if(currentIndex < notes.length - 1){
                let nextWidth = notes[currentIndex+1].windowWidth;
                let nextHeight = notes[currentIndex+1].windowHeight;
                let nextPositionX = notes[currentIndex+1].windowPositionX;
                let nextPositionY = notes[currentIndex+1].windowPositionY;
                addNextNote(nextPositionX,nextPositionY,nextWidth,nextHeight);
            }
        }
        else{
            //no need to load all notes
        }
    }
    catch(err){console.error(err);}
}

function getIndex(){
    let configData = JSON.parse(fs.readFileSync(notesConfigPath,'utf-8'));
    let indeX = configData.index;
    return indeX;
}

function getNotes(){
    let notes = JSON.parse(fs.readFileSync(notesFilePath,'utf-8'));
    return notes;
}

function updateIndex(currentIndex){
    let configData = JSON.stringify({"index":currentIndex});
    fs.writeFileSync(notesConfigPath,configData)
}

function setNoteID(noteId){
    document.getElementById('noteID').innerText = noteId;
}

function setNoteContent(noteContent){
    document.getElementById('textAreaId').value = noteContent;
}

function setWindowSize(windowWidth,windowHeight){
    windowWidth = parseInt(windowWidth);
    windowHeight = parseInt(windowHeight);
    remote.getCurrentWindow().setSize(windowWidth,windowHeight);
}

function setWindowPosition(posX,posY){
    posX = parseInt(posX);
    posY = parseInt(posY);
    remote.getCurrentWindow().setPosition(posX,posY);
}

function addNextNote(xPosition,yPosition,windowWidth,windowHeight){
    
    xPosition = parseInt(xPosition);
    yPosition = parseInt(yPosition);
    windowWidth = parseInt(windowWidth);
    windowHeight = parseInt(windowHeight);

    var newWindow = new remote.BrowserWindow({x:xPosition, y:yPosition, 
        width:windowWidth, 
        height:windowHeight,
        frame: false,
        webPreferences:{
            nodeIntegration:true
        }
    });
    
    newWindow.loadURL("file://"+__dirname+"/index.html");
}

function addNewNote(openWindow){
    
    let notes = getNotes();
    let lastItemId = parseInt(notes[notes.length-1].id);
    var newNote = {};
    newNote.id = lastItemId+1;
    newNote.content = "";
    newNote.windowWidth = 200;
    newNote.windowHeight = 200;
    newNote.windowPositionX = 0;
    newNote.windowPositionY = 0;
    notes.push(newNote);
    writeNotesToFile(notes);

    openWindow = parseInt(openWindow);
    if(openWindow != 0){
        addNextNote(0,0,200,200);
    }
    
}

function deleteNote(){

    let noteId = getNoteID();
    let notes = getNotes();

    let newNotes = notes.filter(function(item){
        if(item.id != noteId){
            return item;
        }
    });

    writeNotesToFile(newNotes);

    let currentIndex = getIndex();
    updateIndex(currentIndex-1);

    window.close();
}

function updateNote(){
    let noteId = getNoteID();
    let noteContent = getNoteContent();
    let winSize = getWindowSize()
    let winSizeWidth = winSize[0];
    let winSizeHeight = winSize[0];
    let winPosition = getWindowPosition();
    let winPositionX = winPosition[0];
    let winPositionY = winPosition[0];
    let notes = getNotes();

    let note = notes.find(element => element.id == noteId);
    note.content = noteContent;
    note.windowWidth = winSizeWidth;
    note.windowHeight = winSizeHeight;
    note.windowPositionX = winPositionX;
    note.windowPositionY = winPositionY;

    writeNotesToFile(notes);
}

function writeNotesToFile(notes){
    fs.writeFileSync(notesFilePath,JSON.stringify(notes));
}

function getNoteID(){
    let noteID = parseInt(document.getElementById("noteID").innerText);
    return noteID;
}

function getNoteContent(){
    let noteContent = document.getElementById("textAreaId").value;
    return noteContent;
}

function getWindowSize(){
    var windowSize = remote.getCurrentWindow().getSize();
    return windowSize;
}

function getWindowPosition(){
    var windowPosition = remote.getCurrentWindow().getPosition();
    return windowPosition;
}