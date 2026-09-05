const addNoteBtn = document.getElementById("addNoteBtn");
const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const noteForm = document.getElementById("noteForm");

const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const noteCategory = document.getElementById("noteCategory");
const noteImage = document.getElementById("noteImage");
const noteReminder = document.getElementById("noteReminder");

const imagePreview = document.getElementById("imagePreview");
const notesContainer = document.getElementById("notesContainer");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const themeBtn = document.getElementById("themeBtn");

const totalCount = document.getElementById("totalCount");
const favoriteCount = document.getElementById("favoriteCount");
const pinnedCount = document.getElementById("pinnedCount");
const archiveCount = document.getElementById("archiveCount");

const checkItem = document.getElementById("checkItem");
const addCheckBtn = document.getElementById("addCheckBtn");
const checklistPreview = document.getElementById("checklistPreview");

let notes = JSON.parse(localStorage.getItem("myNotes")) || [];

let editingId = null;

let currentImage = "";

let checklist = [];

let showArchived = false;


/* =========================
   OPEN NEW NOTE
========================= */

addNoteBtn.addEventListener("click", () => {

    editingId = null;

    document.getElementById("modalTitle").textContent =
        "Create New Note";

    noteForm.reset();

    checklist = [];

    currentImage = "";

    checklistPreview.innerHTML = "";

    imagePreview.innerHTML = "";

    noteModal.style.display = "flex";

    noteTitle.focus();
});


/* =========================
   CLOSE MODAL
========================= */

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

function closeModal() {

    noteModal.style.display = "none";

    noteForm.reset();

    checklist = [];

    currentImage = "";

    checklistPreview.innerHTML = "";

    imagePreview.innerHTML = "";
}


/* =========================
   IMAGE
========================= */

noteImage.addEventListener("change", () => {

    const file = noteImage.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {

        currentImage = event.target.result;

        imagePreview.innerHTML = `
            <img src="${currentImage}" alt="Note Image">
        `;
    };

    reader.readAsDataURL(file);
});


/* =========================
   CHECKLIST
========================= */

addCheckBtn.addEventListener("click", addChecklistItem);

checkItem.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        addChecklistItem();
    }
});


function addChecklistItem() {

    const text = checkItem.value.trim();

    if (!text) return;

    checklist.push({
        text: text,
        done: false
    });

    checkItem.value = "";

    displayChecklist();
}


function displayChecklist() {

    checklistPreview.innerHTML = "";

    checklist.forEach((item, index) => {

        const div = document.createElement("div");

        div.className = "check-item";

        div.innerHTML = `
            <input
                type="checkbox"
                ${item.done ? "checked" : ""}
                onchange="toggleChecklist(${index})"
            >

            <span>${escapeHTML(item.text)}</span>

            <button
                type="button"
                onclick="removeChecklist(${index})"
            >
                ×
            </button>
        `;

        checklistPreview.appendChild(div);
    });
}


function toggleChecklist(index) {

    checklist[index].done =
        !checklist[index].done;

    displayChecklist();
}


function removeChecklist(index) {

    checklist.splice(index, 1);

    displayChecklist();
}


/* =========================
   SAVE NOTE
========================= */

noteForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = noteTitle.value.trim();

    const text = noteText.value.trim();

    const category = noteCategory.value;

    const reminder = noteReminder.value;

    const selectedColor =
        document.querySelector(
            'input[name="noteColor"]:checked'
        ).value;


    if (!title || !text) {

        alert("Please enter title and note.");

        return;
    }


    const saveNote = function(image) {

        if (editingId) {

            const note = notes.find(
                n => n.id === editingId
            );

            if (note) {

                note.title = title;

                note.text = text;

                note.category = category;

                note.color = selectedColor;

                note.image = image;

                note.reminder = reminder;

                note.checklist = checklist;
            }

        } else {

            const newNote = {

                id: Date.now(),

                title: title,

                text: text,

                category: category,

                color: selectedColor,

                image: image,

                reminder: reminder,

                checklist: checklist,

                favorite: false,

                pinned: false,

                archived: false,

                createdAt: new Date().toISOString()

            };

            notes.unshift(newNote);
        }


        saveNotes();

        displayNotes();

        closeModal();
    };


    if (noteImage.files[0]) {

        const reader = new FileReader();

        reader.onload = function(event) {

            saveNote(event.target.result);
        };

        reader.readAsDataURL(noteImage.files[0]);

    } else {

        saveNote(currentImage);
    }

});


/* =========================
   DISPLAY NOTES
========================= */

function displayNotes() {

    let filtered = [...notes];


    /* SEARCH */

    const search =
        searchInput.value.toLowerCase().trim();

    if (search) {

        filtered = filtered.filter(note =>

            note.title.toLowerCase().includes(search) ||

            note.text.toLowerCase().includes(search) ||

            note.category.toLowerCase().includes(search)
        );
    }


    /* CATEGORY */

    const category = categoryFilter.value;

    if (category !== "all") {

        filtered = filtered.filter(
            note => note.category === category
        );
    }


    /* ARCHIVE */

    filtered = filtered.filter(
        note => note.archived === showArchived
    );


    /* SORT */

    const sort = sortSelect.value;

    if (sort === "newest") {

        filtered.sort(
            (a,b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    } else if (sort === "oldest") {

        filtered.sort(
            (a,b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    } else if (sort === "az") {

        filtered.sort(
            (a,b) =>
                a.title.localeCompare(b.title)
        );

    } else if (sort === "za") {

        filtered.sort(
            (a,b) =>
                b.title.localeCompare(a.title)
        );
    }


    /* PINNED FIRST */

    filtered.sort(
        (a,b) =>
            Number(b.pinned) -
            Number(a.pinned)
    );


    notesContainer.innerHTML = "";


    if (filtered.length === 0) {

        notesContainer.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    📝
                </div>

                <h2>
                    ${showArchived
                        ? "No Archived Notes"
                        : "No Notes Found"}
                </h2>

                <p>
                    Create a new note to get started.
                </p>

            </div>
        `;

        updateStats();

        return;
    }


    filtered.forEach(note => {

        const card =
            document.createElement("div");

        card.className =
            `note-card ${note.color || "purple"}`;


        let checklistHTML = "";

        if (
            note.checklist &&
            note.checklist.length
        ) {

            checklistHTML =
                note.checklist.map(item => `

                    <div class="
                        check-item
                        ${item.done ? "done" : ""}
                    ">

                        <span>
                            ${item.done ? "☑" : "☐"}
                        </span>

                        ${escapeHTML(item.text)}

                    </div>

                `).join("");
        }


        const reminderHTML =
            note.reminder
                ? `
                    <div class="reminder">
                        ⏰
                        ${formatDate(note.reminder)}
                    </div>
                `
                : "";


        card.innerHTML = `

            ${
                note.image
                ? `
                    <img
                        src="${note.image}"
                        alt="Note Image"
                    >
                `
                : ""
            }


            <span class="category">
                ${getCategoryIcon(note.category)}
                ${note.category}
            </span>


            <h2>
                ${note.pinned ? "📌 " : ""}
                ${escapeHTML(note.title)}
            </h2>


            <p>
                ${escapeHTML(note.text)}
            </p>


            ${checklistHTML}

            ${reminderHTML}


            <div class="note-footer">

                <span class="note-date">
                    ${formatDate(note.createdAt)}
                </span>


                <div class="note-actions">

                    <button
                        class="favorite-btn"
                        onclick="toggleFavorite(${note.id})"
                        title="Favorite"
                    >
                        ${note.favorite ? "⭐" : "☆"}
                    </button>


                    <button
                        class="pin-btn"
                        onclick="togglePin(${note.id})"
                        title="Pin"
                    >
                        ${note.pinned ? "📌" : "📍"}
                    </button>


                    <button
                        class="edit-btn"
                        onclick="editNote(${note.id})"
                    >
                        ✏️
                    </button>


                    <button
                        class="archive-btn"
                        onclick="toggleArchive(${note.id})"
                    >
                        ${note.archived ? "↩️" : "📦"}
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteNote(${note.id})"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;


        notesContainer.appendChild(card);
    });


    updateStats();
}


/* =========================
   EDIT
========================= */

function editNote(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;


    editingId = id;


    document.getElementById("modalTitle").textContent =
        "Edit Note";


    noteTitle.value = note.title;

    noteText.value = note.text;

    noteCategory.value = note.category;

    noteReminder.value = note.reminder || "";


    currentImage = note.image || "";


    if (currentImage) {

        imagePreview.innerHTML = `
            <img src="${currentImage}">
        `;
    }


    checklist =
        note.checklist
        ? [...note.checklist]
        : [];


    displayChecklist();


    const colorRadio =
        document.querySelector(
            `input[name="noteColor"][value="${note.color}"]`
        );

    if (colorRadio) {

        colorRadio.checked = true;
    }


    noteModal.style.display = "flex";
}


/* =========================
   DELETE
========================= */

function deleteNote(id) {

    const confirmDelete =
        confirm(
            "Move this note to Trash?"
        );

    if (!confirmDelete) return;


    notes =
        notes.filter(
            note => note.id !== id
        );


    saveNotes();

    displayNotes();
}


/* =========================
   FAVORITE
========================= */

function toggleFavorite(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;

    note.favorite = !note.favorite;

    saveNotes();

    displayNotes();
}


/* =========================
   PIN
========================= */

function togglePin(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;

    note.pinned = !note.pinned;

    saveNotes();

    displayNotes();
}


/* =========================
   ARCHIVE
========================= */

function toggleArchive(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;

    note.archived = !note.archived;

    saveNotes();

    displayNotes();
}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    displayNotes
);

categoryFilter.addEventListener(
    "change",
    displayNotes
);

sortSelect.addEventListener(
    "change",
    displayNotes
);


/* =========================
   ARCHIVE / ALL BUTTONS
========================= */

document
    .getElementById("archiveViewBtn")
    .addEventListener("click", function() {

        showArchived = true;

        this.classList.add("active");

        document
            .getElementById("allNotesBtn")
            .classList.remove("active");

        displayNotes();
    });


document
    .getElementById("allNotesBtn")
    .addEventListener("click", function() {

        showArchived = false;

        this.classList.add("active");

        document
            .getElementById("archiveViewBtn")
            .classList.remove("active");

        displayNotes();
    });


/* =========================
   STATS
========================= */

function updateStats() {

    totalCount.textContent =
        notes.filter(
            note => !note.archived
        ).length;


    favoriteCount.textContent =
        notes.filter(
            note => note.favorite
        ).length;


    pinnedCount.textContent =
        notes.filter(
            note => note.pinned
        ).length;


    archiveCount.textContent =
        notes.filter(
            note => note.archived
        ).length;
}


/* =========================
   DARK MODE
========================= */

themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");

        const dark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "darkMode",
            dark
        );

        themeBtn.textContent =
            dark ? "☀️" : "🌙";
    }
);


if (
    localStorage.getItem("darkMode") === "true"
) {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";
}


/* =========================
   EXPORT TXT
========================= */

document
    .getElementById("exportTxtBtn")
    .addEventListener("click", function() {

        if (!notes.length) {

            alert("No notes to export.");

            return;
        }


        let content = "";


        notes.forEach(note => {

            content +=
                `TITLE: ${note.title}\n`;

            content +=
                `CATEGORY: ${note.category}\n`;

            content +=
                `DATE: ${formatDate(note.createdAt)}\n`;

            content +=
                `\n${note.text}\n`;

            content +=
                `\n----------------------\n\n`;
        });


        downloadFile(
            "my-notes.txt",
            content,
            "text/plain"
        );
    });


/* =========================
   EXPORT JSON
========================= */

document
    .getElementById("exportJsonBtn")
    .addEventListener("click", function() {

        const content =
            JSON.stringify(notes, null, 2);

        downloadFile(
            "my-notes.json",
            content,
            "application/json"
        );
    });


function downloadFile(
    filename,
    content,
    type
) {

    const blob =
        new Blob(
            [content],
            { type: type }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);
}


/* =========================
   IMPORT JSON
========================= */

const importBtn =
    document.getElementById("importBtn");

const importFile =
    document.getElementById("importFile");


importBtn.addEventListener(
    "click",
    () => importFile.click()
);


importFile.addEventListener(
    "change",
    function() {

        const file =
            this.files[0];

        if (!file) return;


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                try {

                    const imported =
                        JSON.parse(
                            event.target.result
                        );


                    if (!Array.isArray(imported)) {

                        alert("Invalid file.");

                        return;
                    }


                    notes = [
                        ...notes,
                        ...imported
                    ];


                    saveNotes();

                    displayNotes();

                    alert(
                        "Notes imported successfully!"
                    );

                } catch {

                    alert(
                        "Invalid JSON file."
                    );
                }
            };


        reader.readAsText(file);
    }
);


/* =========================
   PASSWORD LOCK
========================= */

const passwordModal =
    document.getElementById(
        "passwordModal"
    );

const passwordInput =
    document.getElementById(
        "passwordInput"
    );

const savePasswordBtn =
    document.getElementById(
        "savePasswordBtn"
    );

const cancelPasswordBtn =
    document.getElementById(
        "cancelPasswordBtn"
    );


document
    .getElementById("lockBtn")
    .addEventListener("click", function() {

        passwordInput.value = "";

        passwordModal.style.display = "flex";
    });


cancelPasswordBtn.addEventListener(
    "click",
    function() {

        passwordModal.style.display = "none";
    }
);


savePasswordBtn.addEventListener(
    "click",
    function() {

        const password =
            passwordInput.value.trim();

        if (password.length < 4) {

            alert(
                "Password should be at least 4 characters."
            );

            return;
        }


        localStorage.setItem(
            "notesPassword",
            password
        );


        passwordModal.style.display = "none";

        alert(
            "Password saved successfully!"
        );
    }
);


/* =========================
   TEXT TO SPEECH
========================= */

function speakNote(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;


    const speech =
        new SpeechSynthesisUtterance(
            note.title + ". " + note.text
        );


    speech.rate = 1;

    speech.pitch = 1;


    window.speechSynthesis.speak(
        speech
    );
}


/* =========================
   AI STYLE SUMMARY
========================= */

function summarizeNote(id) {

    const note =
        notes.find(n => n.id === id);

    if (!note) return;


    const sentences =
        note.text
            .split(/[.!?]+/)
            .filter(Boolean);


    let summary =
        sentences.slice(0, 2).join(". ");


    if (!summary) {

        summary = note.text.substring(
            0,
            120
        );
    }


    alert(
        "AI-style Summary:\n\n" +
        summary
    );
}


/* =========================
   HELPERS
========================= */

function saveNotes() {

    localStorage.setItem(
        "myNotes",
        JSON.stringify(notes)
    );
}


function formatDate(date) {

    if (!date) return "";

    return new Date(date)
        .toLocaleString();
}


function getCategoryIcon(category) {

    const icons = {

        Study: "📚",

        Work: "💼",

        Ideas: "💡",

        Personal: "🏠",

        Important: "📌"
    };


    return icons[category] || "📝";
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   INITIAL LOAD
========================= */

displayNotes();