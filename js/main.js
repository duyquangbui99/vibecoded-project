// --- Speech recognition setup (Web Speech API) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = document.getElementById("micBtn");
const statusEl = document.getElementById("status");
const textArea = document.getElementById("transcript");
const errorMsg = document.getElementById("errorMsg");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const notesEl = document.getElementById("notes");
const emptyState = document.getElementById("emptyState");

let recognition = null;
let listening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
        listening = true;
        micBtn.classList.add("recording");
        statusEl.innerHTML = "<strong>Listening…</strong> Speak naturally, click again to stop.";
        errorMsg.style.display = "none";
    };

    recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript + " ";
        }
        textArea.value = text.trim();
    };

    recognition.onerror = (event) => {
        errorMsg.style.display = "block";
        errorMsg.textContent = "Error: " + event.error;
        stopListening();
    };

    recognition.onend = () => {
        if (listening) {
            // Auto–restart if it ended unexpectedly
            recognition.start();
            return;
        }
        micBtn.classList.remove("recording");
        statusEl.innerHTML = "<strong>Paused.</strong> Click the mic to resume recording.";
    };
} else {
    statusEl.innerHTML = "<strong>Browser not supported.</strong> Try Chrome on desktop or Android.";
    micBtn.disabled = true;
}

function startListening() {
    if (!recognition) return;
    listening = true;
    recognition.start();
}

function stopListening() {
    if (!recognition) return;
    listening = false;
    recognition.stop();
    micBtn.classList.remove("recording");
}

micBtn.addEventListener("click", () => {
    if (!recognition) return;
    if (listening) {
        stopListening();
    } else {
        startListening();
    }
});

clearBtn.addEventListener("click", () => {
    textArea.value = "";
    errorMsg.style.display = "none";
});

// --- Simple in-page "DB" of notes ---
const notes = [];
let nextId = 1;

function renderNotes() {
    notesEl.innerHTML = "";
    if (notes.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    notes
        .slice()
        .reverse()
        .forEach((note) => {
            const card = document.createElement("div");
            card.className = "note-card";

            const meta = document.createElement("div");
            meta.className = "note-meta";

            const time = document.createElement("span");
            time.textContent = new Date(note.createdAt).toLocaleString();

            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = "Voice note";

            meta.appendChild(time);
            meta.appendChild(tag);

            const text = document.createElement("div");
            text.className = "note-text";
            text.textContent = note.text;

            // --- delete button ---
            const actions = document.createElement("div");
            actions.className = "note-actions";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "btn-delete-note";
            deleteBtn.textContent = "Delete";

            deleteBtn.addEventListener("click", () => {
                const index = notes.findIndex(n => n.id === note.id);
                if (index !== -1) {
                    notes.splice(index, 1);
                    renderNotes();
                }
            });

            actions.appendChild(deleteBtn);

            card.appendChild(meta);
            card.appendChild(text);
            card.appendChild(actions);
            notesEl.appendChild(card);
        });
}

saveBtn.addEventListener("click", () => {
    const text = textArea.value.trim();
    if (!text) {
        errorMsg.style.display = "block";
        errorMsg.textContent = "There is nothing to save yet. Record or type a note first.";
        return;
    }
    notes.push({ id: nextId++, text, createdAt: Date.now() });
    textArea.value = "";
    errorMsg.style.display = "none";
    renderNotes();
});

// initial render
renderNotes();
