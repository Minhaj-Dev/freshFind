/**
 * FreshFind - Bookmark & Session Notes System
 * Manages:
 * - Persistent saved markets & produce in localStorage ('freshfind_saved_markets', 'freshfind_saved_produce')
 * - Ephemeral session notes in sessionStorage ('freshfind_session_notes')
 * - Export bookmarks to file (JSON or TXT)
 * - Navigation badge updates
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  const STORAGE_KEY_MARKETS = "freshfind_saved_markets";
  const STORAGE_KEY_PRODUCE = "freshfind_saved_produce";
  const SESSION_KEY_NOTES = "freshfind_session_notes";

  function getStoredList(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
      return [];
    }
  }

  function setStoredList(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
      updateBookmarkBadges();
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  function getSessionNotes() {
    try {
      const data = sessionStorage.getItem(SESSION_KEY_NOTES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function setSessionNotes(notesObj) {
    try {
      sessionStorage.setItem(SESSION_KEY_NOTES, JSON.stringify(notesObj));
    } catch (e) {
      console.warn("Could not write to sessionStorage:", e);
    }
  }

  function isBookmarked(type, id) {
    const key = type === "market" ? STORAGE_KEY_MARKETS : STORAGE_KEY_PRODUCE;
    const list = getStoredList(key);
    const strId = String(id);
    return list.some((item) => (typeof item === "object" ? String(item.id) === strId : String(item) === strId));
  }

  function toggleBookmark(type, item) {
    const key = type === "market" ? STORAGE_KEY_MARKETS : STORAGE_KEY_PRODUCE;
    let list = getStoredList(key);
    const itemId = typeof item === "object" ? String(item.id) : String(item);
    const existingIndex = list.findIndex((x) =>
      typeof x === "object" ? String(x.id) === itemId : String(x) === itemId
    );

    let added = false;
    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      added = false;
    } else {
      list.push(item);
      added = true;
    }

    setStoredList(key, list);

    if (window.FreshFind && window.FreshFind.showToast) {
      const title = typeof item === "object" && item.name ? item.name : "Item";
      window.FreshFind.showToast(
        added ? `Added "${title}" to bookmarks` : `Removed "${title}" from bookmarks`,
        added ? "success" : "info"
      );
    }

    return added;
  }

  function getBookmarks(type) {
    const key = type === "market" ? STORAGE_KEY_MARKETS : STORAGE_KEY_PRODUCE;
    return getStoredList(key);
  }

  function removeBookmark(type, id) {
    const key = type === "market" ? STORAGE_KEY_MARKETS : STORAGE_KEY_PRODUCE;
    let list = getStoredList(key);
    const strId = String(id);
    list = list.filter((item) => (typeof item === "object" ? String(item.id) !== strId : String(item) !== strId));
    setStoredList(key, list);
  }

  function getNote(type, id) {
    const notes = getSessionNotes();
    const noteKey = `${type}_${id}`;
    return notes[noteKey] || "";
  }

  function saveNote(type, id, noteText) {
    const notes = getSessionNotes();
    const noteKey = `${type}_${id}`;
    if (!noteText || !noteText.trim()) {
      delete notes[noteKey];
    } else {
      notes[noteKey] = noteText.trim();
    }
    setSessionNotes(notes);
  }

  function deleteNote(type, id) {
    saveNote(type, id, "");
  }

  function updateBookmarkBadges() {
    if (typeof document === "undefined" || !document.querySelectorAll) return;
    const markets = getBookmarks("market");
    const produce = getBookmarks("produce");
    const total = markets.length + produce.length;

    const badges = document.querySelectorAll(".bookmark-count-badge, .badge, #bookmarkCount");
    badges.forEach((b) => {
      b.textContent = total;
      if (total > 0) {
        b.classList.add("has-items");
      } else {
        b.classList.remove("has-items");
      }
    });
  }

  /**
   * Export bookmarks and session notes to a downloadable file.
   * Generates formatted text/markdown report client-side.
   */
  function exportBookmarksToFile(format) {
    const markets = getBookmarks("market");
    const produce = getBookmarks("produce");
    const notes = getSessionNotes();
    const dateStr = new Date().toLocaleString();

    let content = "";
    let mimeType = "text/plain";
    let filename = `freshfind-bookmarks-${new Date().toISOString().slice(0, 10)}.txt`;

    if (format === "json") {
      const exportData = {
        exportedAt: dateStr,
        application: "FreshFind — Fresh All Along",
        savedMarkets: markets.map((m) => {
          const id = typeof m === "object" ? m.id : m;
          return {
            market: m,
            sessionNote: notes[`market_${id}`] || null
          };
        }),
        savedProduce: produce.map((p) => {
          const id = typeof p === "object" ? p.id : p;
          return {
            produce: p,
            sessionNote: notes[`produce_${id}`] || null
          };
        })
      };
      content = JSON.stringify(exportData, null, 2);
      mimeType = "application/json";
      filename = `freshfind-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      content += `=========================================\n`;
      content += `        FRESHFIND SAVED BOOKMARKS        \n`;
      content += `           Fresh All Along               \n`;
      content += `   Exported: ${dateStr}                  \n`;
      content += `=========================================\n\n`;

      content += `--- SAVED FARMERS MARKETS (${markets.length}) ---\n`;
      if (markets.length === 0) {
        content += `(No saved markets)\n\n`;
      } else {
        markets.forEach((m, idx) => {
          const id = typeof m === "object" ? m.id : m;
          const name = typeof m === "object" ? m.name : `Market #${m}`;
          const area = typeof m === "object" ? m.area : "";
          const hours = typeof m === "object" ? (m.operatingHours || m.time) : "";
          const days = typeof m === "object" && Array.isArray(m.operatingDays) ? m.operatingDays.join(", ") : (m.day || "");
          const note = notes[`market_${id}`];

          content += `[${idx + 1}] ${name}\n`;
          if (area) content += `    Area: ${area}\n`;
          if (days) content += `    Days: ${days}\n`;
          if (hours) content += `    Hours: ${hours}\n`;
          if (note) content += `    Session Note: "${note}"\n`;
          content += `\n`;
        });
      }

      content += `--- SAVED PRODUCE (${produce.length}) ---\n`;
      if (produce.length === 0) {
        content += `(No saved produce)\n\n`;
      } else {
        produce.forEach((p, idx) => {
          const id = typeof p === "object" ? p.id : p;
          const name = typeof p === "object" ? p.name : `Produce #${p}`;
          const cat = typeof p === "object" ? p.category : "";
          const season = typeof p === "object" ? p.season : "";
          const note = notes[`produce_${id}`];

          content += `[${idx + 1}] ${name}\n`;
          if (cat) content += `    Category: ${cat}\n`;
          if (season) content += `    Season: ${season}\n`;
          if (note) content += `    Session Note: "${note}"\n`;
          content += `\n`;
        });
      }

      content += `=========================================\n`;
      content += `Thank you for supporting your local growers!\n`;
      content += `FreshFind — https://freshfind.local\n`;
    }

    // Trigger browser download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.FreshFind && window.FreshFind.showToast) {
      window.FreshFind.showToast("Bookmarks file downloaded successfully!", "success");
    }
  }

  // Export functions to namespace
  FreshFind.isBookmarked = isBookmarked;
  FreshFind.toggleBookmark = toggleBookmark;
  FreshFind.getBookmarks = getBookmarks;
  FreshFind.removeBookmark = removeBookmark;
  FreshFind.getNote = getNote;
  FreshFind.saveNote = saveNote;
  FreshFind.deleteNote = deleteNote;
  FreshFind.updateBookmarkBadges = updateBookmarkBadges;
  FreshFind.exportBookmarksToFile = exportBookmarksToFile;

  // Initialize badge count on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateBookmarkBadges);
  } else {
    updateBookmarkBadges();
  }

})(window);
