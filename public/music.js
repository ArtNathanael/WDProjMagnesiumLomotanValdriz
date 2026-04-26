const ROWS = 8;
const STEPS = 24;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

let grid = [];
let playing = false;    
let currentStep = 0;
let intervalId = null;
let tempo = 120;
let currentInstrument = 'piano';
let currentKey = 'C';

const KEY_FREQS = {
    'C':  [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
    'G':  [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 369.99, 392.00],
    'D':  [146.83, 164.81, 185.00, 196.00, 220.00, 246.94, 277.18, 293.66],
    'A':  [110.00, 123.47, 138.59, 146.83, 164.81, 185.00, 207.65, 220.00],
    'F':  [174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 311.13, 349.23],
    'Am': [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
    'Em': [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63],
    'Dm': [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66],
};

const NOTE_NAMES = {
    'C':  ['C4','D4','E4','F4','G4','A4','B4','C5'],
    'G':  ['G3','A3','B3','C4','D4','E4','F#4','G4'],
    'D':  ['D3','E3','F#3','G3','A3','B3','C#4','D4'],
    'A':  ['A2','B2','C#3','D3','E3','F#3','G#3','A3'],
    'F':  ['F3','G3','A3','Bb3','C4','D4','Eb4','F4'],
    'Am': ['A3','B3','C4','D4','E4','F4','G4','A4'],
    'Em': ['E3','F#3','G3','A3','B3','C4','D4','E4'],
    'Dm': ['D3','E3','F3','G3','A3','Bb3','C4','D4'],
};

const PERIOD_PRESETS = {
    medieval:  { rows: [0,2,4,5], steps: [[0,4,8,12],[2,6,10,14],[1,5,9,13],[3,7,11,15]] },
    baroque:   { rows: [0,1,2,3], steps: [[0,2,4,6,8,10,12,14],[1,3,5,7],[0,4,8,12],[2,6,10,14]] },
    classical: { rows: [0,1,3,5], steps: [[0,4,8,12],[2,6,10,14],[1,5],[3,7,11,15]] },
    romantic:  { rows: [0,2,4,6], steps: [[0,3,6,9,12,15],[1,4,7,10,13],[2,5,8,11,14],[0,8]] },
    jazz:      { rows: [0,1,2,3,5], steps: [[0,3,6,9,12],[2,5,8,11,14],[1,4,7,10,13],[0,6,12],[3,9,15]] },
    modern:    { rows: [0,2,4,6,7], steps: [[0,2,4,6,8,10,12,14],[1,5,9,13],[0,4,8,12],[2,6,10,14],[3,7,11,15]] },
};

function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid.push(new Array(STEPS).fill(false));
    }
}

function buildGrid() {
    const numRow = document.getElementById("stepNumbers");
    numRow.innerHTML = Array.from({length: STEPS}, (_,i) =>
        `<div class="step-num">${i+1}</div>`
    ).join("");

    const seqGrid = document.getElementById("seqGrid");
    seqGrid.style.gridTemplateColumns = `46px repeat(${STEPS}, 32px)`;
    seqGrid.innerHTML = "";

    const names = NOTE_NAMES[currentKey] || NOTE_NAMES['C'];

    for (let r = 0; r < ROWS; r++) {
        const label = document.createElement("div");
        label.className = "row-label";
        label.textContent = names[ROWS - 1 - r];
        seqGrid.appendChild(label);

        for (let s = 0; s < STEPS; s++) {
            const cell = document.createElement("div");
            cell.className = "seq-cell" + (s % 4 === 0 ? " beat-marker" : "");
            cell.dataset.row = r;
            cell.dataset.step = s;
            if (grid[r][s]) cell.classList.add("active");
            cell.onclick = () => toggleCell(r, s, cell);
            seqGrid.appendChild(cell);
        }
    }
}

function toggleCell(r, s, cell) {
    grid[r][s] = !grid[r][s];
    cell.classList.toggle("active", grid[r][s]);
}

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playNote(freq, instrument) {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    switch (instrument) {
        case 'piano':
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            break;
        case 'marimba':
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            break;
        case 'harp':
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
            break;
        case 'organ':
            osc.type = 'square';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.setValueAtTime(0.2, now + 0.3);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
            break;
        case 'flute':
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            break;
        case 'drums':
            playDrum(now);
            return;
    }

    osc.frequency.setValueAtTime(freq, now);
    osc.start(now);
    osc.stop(now + 1.5);
}

function playDrum(when) {
    const bufSize = audioCtx.sampleRate * 0.15;
    const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.15);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 200;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    src.start(when);
}

function togglePlay() {
    if (playing) { stopSeq(); return; }
    ensureAudio();
    playing = true;
    document.getElementById("playBtn").textContent = "⏸ Pause";
    currentStep = 0;
    scheduleNext();
}

function stopSeq() {
    playing = false;
    clearTimeout(intervalId);
    document.getElementById("playBtn").textContent = "▶ Play";
    document.querySelectorAll(".seq-cell.playing").forEach(c => c.classList.remove("playing"));
    currentStep = 0;
}

function scheduleNext() {
    if (!playing) return;

    const stepDuration = (60 / tempo) / 4;
    const freqs = KEY_FREQS[currentKey] || KEY_FREQS['C'];

    document.querySelectorAll(".seq-cell.playing").forEach(c => c.classList.remove("playing"));
    for (let r = 0; r < ROWS; r++) {
        const cell = document.querySelector(`.seq-cell[data-row="${r}"][data-step="${currentStep}"]`);
        if (cell) cell.classList.add("playing");
        if (grid[r][currentStep]) {
            playNote(freqs[ROWS - 1 - r], currentInstrument);
        }
    }

    currentStep = (currentStep + 1) % STEPS;
    intervalId = setTimeout(scheduleNext, stepDuration * 1000);
}

function updateTempo(val) {
    tempo = parseInt(val);
    document.getElementById("tempoDisplay").textContent = tempo + " BPM";
}

function updateKey(val) {
    currentKey = val;
    buildGrid();
}

function clearGrid() {
    initGrid();
    buildGrid();
}

function selectInstrument(name, btn) {
    currentInstrument = name;
    document.querySelectorAll(".instr-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function selectPeriod(name, btn) {
    document.querySelectorAll(".period-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyPeriodPreset(name);
    document.querySelector(".period-select").value = name;
}

function applyPeriodPreset(name) {
    const preset = PERIOD_PRESETS[name];
    if (!preset) return;
    initGrid();
    preset.rows.forEach((r, i) => {
        if (preset.steps[i]) {
            preset.steps[i].forEach(s => {
                if (s < STEPS) grid[r][s] = true;
            });
        }
    });
    buildGrid();
}

function saveComposition() {
    const name = document.getElementById("compNameInput").value.trim();
    if (!name) { showMsg("Please enter a composition name.", "error"); return; }

    const drafts = JSON.parse(localStorage.getItem("resonusSavedDrafts") || "[]");
    const existing = drafts.find(d => d.name === name);

    if (existing) {
        existing.data = JSON.stringify(grid);
        existing.instrument = currentInstrument;
        existing.key = currentKey;
        existing.tempo = tempo;
        existing.savedAt = new Date().toLocaleString();
        showMsg(`"${name}" updated!`, "success");
    } else {
        drafts.push({ name, data: JSON.stringify(grid), instrument: currentInstrument, key: currentKey, tempo, savedAt: new Date().toLocaleString() });
        showMsg(`"${name}" saved!`, "success");
    }

    localStorage.setItem("resonusSavedDrafts", JSON.stringify(drafts));
    logActivity(`Created composition "${name}"`);
    document.getElementById("compNameInput").value = "";
    renderSavedList();
}

function loadDraft(name) {
    const drafts = JSON.parse(localStorage.getItem("resonusSavedDrafts") || "[]");
    const draft = drafts.find(d => d.name === name);
    if (!draft) return;

    grid = JSON.parse(draft.data);
    currentInstrument = draft.instrument || 'piano';
    currentKey = draft.key || 'C';
    tempo = draft.tempo || 120;

    document.getElementById("tempoSlider").value = tempo;
    document.getElementById("tempoDisplay").textContent = tempo + " BPM";
    document.getElementById("keySelect").value = currentKey;
    document.getElementById("compNameInput").value = name;

    document.querySelectorAll(".instr-btn").forEach(b => {
        b.classList.toggle("active", b.textContent.toLowerCase().includes(currentInstrument));
    });

    buildGrid();
    showMsg(`"${name}" loaded!`, "success");
}

function deleteDraft(name) {
    if (!confirm(`Delete "${name}"?`)) return;
    const drafts = JSON.parse(localStorage.getItem("resonusSavedDrafts") || "[]");
    localStorage.setItem("resonusSavedDrafts", JSON.stringify(drafts.filter(d => d.name !== name)));
    logActivity(`Deleted draft "${name}"`);
    renderSavedList();
    showMsg(`"${name}" deleted.`, "error");
}

function publishToCommunity(name) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) { alert("Please log in first."); return; }

    const drafts = JSON.parse(localStorage.getItem("resonusSavedDrafts") || "[]");
    const draft = drafts.find(d => d.name === name);
    if (!draft) return;

    const comps = JSON.parse(localStorage.getItem("resonusCompositions") || "[]");
    const exists = comps.find(c => c.name === name && c.author === loggedInUser);

    if (exists) {
        exists.data = draft.data;
        exists.uploadedAt = new Date().toLocaleString();
    } else {
        comps.push({ id: Date.now().toString(), name: draft.name, author: loggedInUser, data: draft.data, instrument: draft.instrument, key: draft.key, tempo: draft.tempo, uploadedAt: new Date().toLocaleString() });
    }

    localStorage.setItem("resonusCompositions", JSON.stringify(comps));
    logActivity(`Uploaded composition "${name}" to Community`);
    showMsg(`"${name}" shared to Community!`, "success");
}

function renderSavedList() {
    const drafts = JSON.parse(localStorage.getItem("resonusSavedDrafts") || "[]");
    const el = document.getElementById("savedList");

    if (drafts.length === 0) {
        el.innerHTML = '<p style="color:#aaa;font-size:13px;font-style:italic;">No saved drafts yet.</p>';
        return;
    }

    el.innerHTML = drafts.map(d => `
        <div class="saved-item">
            <div class="saved-item-name">${escapeHtml(d.name)}</div>
            <div class="saved-item-actions">
                <button class="sa-btn sa-load" onclick="loadDraft('${escapeHtml(d.name)}')">Load</button>
                <button class="sa-btn sa-community" onclick="publishToCommunity('${escapeHtml(d.name)}')">Share</button>
                <button class="sa-btn sa-delete" onclick="deleteDraft('${escapeHtml(d.name)}')">Delete</button>
            </div>
        </div>
    `).join("");
}

function showMsg(msg, type) {
    const el = document.getElementById("compMsg");
    el.textContent = msg;
    el.style.color = type === "error" ? "#e05050" : "#2a9d4e";
    setTimeout(() => el.textContent = "", 2500);
}

function logActivity(text) {
    const activities = JSON.parse(localStorage.getItem("recentActivity") || "[]");
    activities.unshift({ text, time: new Date().toLocaleString() });
    if (activities.length > 10) activities.pop();
    localStorage.setItem("recentActivity", JSON.stringify(activities));
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function checkPlayParam() {
    const params = new URLSearchParams(window.location.search);
    const playId = params.get("play");
    if (!playId) return;

    const comps = JSON.parse(localStorage.getItem("resonusCompositions") || "[]");
    const comp = comps.find(c => c.id === playId);
    if (!comp) return;

    try {
        grid = JSON.parse(comp.data);
        currentInstrument = comp.instrument || 'piano';
        currentKey = comp.key || 'C';
        tempo = comp.tempo || 120;
        document.getElementById("tempoSlider").value = tempo;
        document.getElementById("tempoDisplay").textContent = tempo + " BPM";
        document.getElementById("keySelect").value = currentKey;
        document.getElementById("compNameInput").value = comp.name;
        buildGrid();
        showMsg(`Loaded "${comp.name}" by ${comp.author}`, "success");
    } catch(e) {}
}

window.onload = () => {
    initGrid();
    buildGrid();
    renderSavedList();
    checkPlayParam();
};