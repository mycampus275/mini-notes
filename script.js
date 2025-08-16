// script.js — Phase 1: UI only (no network)
// Purpose: basic form handling, input validation, render list, edit/delete in memory.

"use strict";

// ---------- constants (mirror server rules) ----------
const LIMITS = { titleMax: 120, bodyMax: 5000 };
const qs = (sel) => document.querySelector(sel);

const el = {
  msg: qs("#message"),
  form: qs("#createForm"),
  title: qs("#title"),
  body: qs("#body"),
  clearBtn: qs("#clearFormBtn"),
  list: qs("#notesList"),
  empty: qs("#emptyState"),
  search: qs("#search"),
};

// canonical in-memory state (will be replaced by server data later)
let NOTES = []; // [{id,title,body,createdAt,updatedAt}]

// device id now (will be sent to API later)
function getOrCreateDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}
getOrCreateDeviceId();

// ---------- helpers ----------
function setMessage(text = "") {
  el.msg.textContent = text || "";
}

function validate({ title, body }) {
  const t = (title || "").trim();
  const b = (body || "").trim();
  if (!t) return "Title is required.";
  if (!b) return "Body is required.";
  if (t.length > LIMITS.titleMax) return `Title too long (>${LIMITS.titleMax}).`;
  if (b.length > LIMITS.bodyMax) return `Body too long (>${LIMITS.bodyMax}).`;
  return null;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

// ---------- render ----------
function render() {
  const q = (el.search?.value || "").toLowerCase().trim();
  const filtered = q
    ? NOTES.filter((n) => n.title.toLowerCase().includes(q))
    : NOTES;

  el.list.innerHTML = "";
  if (!filtered.length) {
    el.empty.hidden = false;
    return;
  }
  el.empty.hidden = true;

  for (const n of filtered) {
    const li = document.createElement("li");
    li.className = "note";
    li.dataset.id = n.id;

    li.innerHTML = `
      <div class="note-head">
        <h3 class="note-title">${escapeHtml(n.title)}</h3>
        <time class="note-time" datetime="${n.updatedAt}">
          ${formatTime(n.updatedAt)}
        </time>
      </div>
      <p class="note-body">${escapeHtml(n.body)}</p>
      <div class="note-actions">
        <button class="edit-btn" data-id="${n.id}" aria-label="Edit note ${escapeAttr(
      n.title
    )}">Edit</button>
        <button class="delete-btn" data-id="${n.id}" aria-label="Delete note ${escapeAttr(
      n.title
    )}">Delete</button>
      </div>
    `;
    el.list.appendChild(li);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(s) {
  return escapeHtml(s).replaceAll("\n", " ");
}

// ---------- actions ----------
function addNote({ title, body }) {
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    title: title.trim(),
    body: body.trim(),
    createdAt: now,
    updatedAt: now,
  };
  NOTES.unshift(note); // newest first
  render();
}

function updateNote(id, { title, body }) {
  const i = NOTES.findIndex((n) => n.id === id);
  if (i === -1) return;
  const now = new Date().toISOString();
  NOTES[i] = {
    ...NOTES[i],
    title: title.trim(),
    body: body.trim(),
    updatedAt: now,
  };
  render();
}

function deleteNote(id) {
  NOTES = NOTES.filter((n) => n.id !== id);
  render();
}

// ---------- event wiring ----------
el.form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = { title: el.title.value, body: el.body.value };
  const err = validate(data);
  if (err) {
    setMessage(err);
    return;
  }
  addNote(data);
  setMessage("Note added (UI only).");
  el.form.reset();
  el.title.focus();
});

el.clearBtn?.addEventListener("click", () => {
  setMessage("");
});

el.list?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains("delete-btn")) {
    const ok = confirm("Delete this note?");
    if (ok) {
      deleteNote(id);
      setMessage("Note deleted (UI only).");
    }
  } else if (btn.classList.contains("edit-btn")) {
    const note = NOTES.find((n) => n.id === id);
    if (!note) return;
    const newTitle = prompt("Edit title:", note.title);
    if (newTitle === null) return; // cancelled
    const newBody = prompt("Edit body:", note.body);
    if (newBody === null) return; // cancelled
    const err = validate({ title: newTitle, body: newBody });
    if (err) return setMessage(err);
    updateNote(id, { title: newTitle, body: newBody });
    setMessage("Note updated (UI only).");
  }
});

el.search?.addEventListener("input", () => {
  render();
});

// initial paint
render();

