import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useModals } from "./ModalContext";

const BookmarkContext = createContext(null);

const STORAGE_KEY_MARKETS = "freshfind_saved_markets";
const STORAGE_KEY_PRODUCE = "freshfind_saved_produce";
const SESSION_KEY_NOTES = "freshfind_session_notes";

function readLocalStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn("Error reading localStorage:", e);
    return fallback;
  }
}

function readSessionStorage(key, fallback) {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.warn("Error reading sessionStorage:", e);
    return fallback;
  }
}

export function BookmarkProvider({ children }) {
  const { showToast } = useModals();

  const [savedMarkets, setSavedMarkets] = useState(() =>
    readLocalStorage(STORAGE_KEY_MARKETS, [])
  );
  const [savedProduce, setSavedProduce] = useState(() =>
    readLocalStorage(STORAGE_KEY_PRODUCE, [])
  );
  const [sessionNotes, setSessionNotes] = useState(() =>
    readSessionStorage(SESSION_KEY_NOTES, {})
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(savedMarkets));
    } catch (e) {
      console.warn("Could not save markets to localStorage:", e);
    }
  }, [savedMarkets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCE, JSON.stringify(savedProduce));
    } catch (e) {
      console.warn("Could not save produce to localStorage:", e);
    }
  }, [savedProduce]);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY_NOTES, JSON.stringify(sessionNotes));
    } catch (e) {
      console.warn("Could not save session notes:", e);
    }
  }, [sessionNotes]);

  const isMarketSaved = useCallback(
    (id) => {
      const strId = String(id);
      return savedMarkets.some((m) =>
        typeof m === "object" ? String(m.id) === strId : String(m) === strId
      );
    },
    [savedMarkets]
  );

  const toggleMarketBookmark = useCallback(
    (market) => {
      const strId = String(market.id || market);
      const exists = savedMarkets.some((m) =>
        typeof m === "object" ? String(m.id) === strId : String(m) === strId
      );

      if (exists) {
        setSavedMarkets((prev) =>
          prev.filter((m) =>
            typeof m === "object" ? String(m.id) !== strId : String(m) !== strId
          )
        );
        showToast(`Removed "${market.name || 'Market'}" from bookmarks`, "info");
        return false;
      } else {
        setSavedMarkets((prev) => [...prev, market]);
        showToast(`Added "${market.name || 'Market'}" to bookmarks`, "success");
        return true;
      }
    },
    [savedMarkets, showToast]
  );

  const removeMarketBookmark = useCallback(
    (id) => {
      const strId = String(id);
      setSavedMarkets((prev) =>
        prev.filter((m) =>
          typeof m === "object" ? String(m.id) !== strId : String(m) !== strId
        )
      );
      showToast("Market removed from bookmarks", "info");
    },
    [showToast]
  );

  const isProduceSaved = useCallback(
    (id) => {
      const strId = String(id);
      return savedProduce.some((p) =>
        typeof p === "object" ? String(p.id) === strId : String(p) === strId
      );
    },
    [savedProduce]
  );

  const toggleProduceBookmark = useCallback(
    (produce) => {
      const strId = String(produce.id || produce);
      const exists = savedProduce.some((p) =>
        typeof p === "object" ? String(p.id) === strId : String(p) === strId
      );

      if (exists) {
        setSavedProduce((prev) =>
          prev.filter((p) =>
            typeof p === "object" ? String(p.id) !== strId : String(p) !== strId
          )
        );
        showToast(`Removed "${produce.name || 'Produce'}" from bookmarks`, "info");
        return false;
      } else {
        setSavedProduce((prev) => [...prev, produce]);
        showToast(`Added "${produce.name || 'Produce'}" to bookmarks`, "success");
        return true;
      }
    },
    [savedProduce, showToast]
  );

  const removeProduceBookmark = useCallback(
    (id) => {
      const strId = String(id);
      setSavedProduce((prev) =>
        prev.filter((p) =>
          typeof p === "object" ? String(p.id) !== strId : String(p) !== strId
        )
      );
      showToast("Produce item removed from bookmarks", "info");
    },
    [showToast]
  );

  const getNote = useCallback(
    (type, id) => {
      return sessionNotes[`${type}_${id}`] || "";
    },
    [sessionNotes]
  );

  const saveNote = useCallback(
    (type, id, noteText) => {
      const key = `${type}_${id}`;
      setSessionNotes((prev) => {
        const next = { ...prev };
        if (!noteText || !noteText.trim()) {
          delete next[key];
        } else {
          next[key] = noteText.trim();
        }
        return next;
      });
      showToast(noteText?.trim() ? "Session note saved" : "Session note removed", "success");
    },
    [showToast]
  );

  const deleteNote = useCallback(
    (type, id) => {
      saveNote(type, id, "");
    },
    [saveNote]
  );

  const totalBookmarksCount = savedMarkets.length + savedProduce.length;

  const exportBookmarksToFile = useCallback(
    (format = "txt") => {
      const dateStr = new Date().toLocaleString();
      let content = "";
      let mimeType = "text/plain";
      let filename = `freshfind-bookmarks-${new Date().toISOString().slice(0, 10)}.txt`;

      if (format === "json") {
        const exportData = {
          exportedAt: dateStr,
          application: "FreshFind — Fresh All Along",
          savedMarkets: savedMarkets.map((m) => {
            const id = typeof m === "object" ? m.id : m;
            return {
              market: m,
              sessionNote: sessionNotes[`market_${id}`] || null
            };
          }),
          savedProduce: savedProduce.map((p) => {
            const id = typeof p === "object" ? p.id : p;
            return {
              produce: p,
              sessionNote: sessionNotes[`produce_${id}`] || null
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

        content += `--- SAVED FARMERS MARKETS (${savedMarkets.length}) ---\n`;
        if (savedMarkets.length === 0) {
          content += `(No saved markets)\n\n`;
        } else {
          savedMarkets.forEach((m, idx) => {
            const id = typeof m === "object" ? m.id : m;
            const name = typeof m === "object" ? m.name : `Market #${m}`;
            const area = typeof m === "object" ? m.area : "";
            const hours = typeof m === "object" ? (m.operatingHours || m.time) : "";
            const days =
              typeof m === "object" && Array.isArray(m.operatingDays)
                ? m.operatingDays.join(", ")
                : (m.day || "");
            const note = sessionNotes[`market_${id}`];

            content += `[${idx + 1}] ${name}\n`;
            if (area) content += `    Area: ${area}\n`;
            if (days) content += `    Days: ${days}\n`;
            if (hours) content += `    Hours: ${hours}\n`;
            if (note) content += `    Session Note: "${note}"\n`;
            content += `\n`;
          });
        }

        content += `--- SAVED PRODUCE (${savedProduce.length}) ---\n`;
        if (savedProduce.length === 0) {
          content += `(No saved produce)\n\n`;
        } else {
          savedProduce.forEach((p, idx) => {
            const id = typeof p === "object" ? p.id : p;
            const name = typeof p === "object" ? p.name : `Produce #${p}`;
            const cat = typeof p === "object" ? p.category : "";
            const season = typeof p === "object" ? p.season : "";
            const note = sessionNotes[`produce_${id}`];

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

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Bookmarks file downloaded successfully!", "success");
    },
    [savedMarkets, savedProduce, sessionNotes, showToast]
  );

  return (
    <BookmarkContext.Provider
      value={{
        savedMarkets,
        savedProduce,
        sessionNotes,
        isMarketSaved,
        toggleMarketBookmark,
        removeMarketBookmark,
        isProduceSaved,
        toggleProduceBookmark,
        removeProduceBookmark,
        getNote,
        saveNote,
        deleteNote,
        totalBookmarksCount,
        exportBookmarksToFile
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
