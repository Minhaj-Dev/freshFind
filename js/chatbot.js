/**
 * FreshFind - Global Chatbot Assistant
 * Floats at bottom-right of every page.
 * Powered by deterministic keyword matching against data/chatbot.json and live engine checks.
 */

(function (window) {
  "use strict";

  let chatbotData = null;
  let marketsData = null;
  let produceData = null;

  async function loadData() {
    try {
      const [cbRes, mkRes, pdRes] = await Promise.all([
        fetch("data/chatbot.json"),
        fetch("data/markets.json"),
        fetch("data/produce.json")
      ]);
      chatbotData = await cbRes.json();
      marketsData = await mkRes.json();
      produceData = await pdRes.json();
    } catch (e) {
      console.warn("Chatbot data could not be preloaded via fetch:", e);
    }
  }

  function injectChatbotDOM() {
    if (document.getElementById("chatbotLauncher") && document.getElementById("chatbotWindow")) {
      return;
    }

    // Floating Launcher Button
    if (!document.getElementById("chatbotLauncher")) {
      const launcher = document.createElement("button");
      launcher.id = "chatbotLauncher";
      launcher.className = "chatbot-launcher";
      launcher.setAttribute("aria-label", "Open FreshFind Assistant");
      launcher.innerHTML = `
        <span class="chat-bubble-icon">💬</span>
        <span class="chat-launcher-label">Need Help?</span>
        <span class="chat-online-pulse"></span>
      `;
      document.body.appendChild(launcher);
    }

    // Chatbot Window
    if (!document.getElementById("chatbotWindow")) {
      const chatWin = document.createElement("div");
      chatWin.id = "chatbotWindow";
      chatWin.className = "chatbot-window";
      chatWin.innerHTML = `
        <div class="chatbot-header">
          <div class="chatbot-title">
            <div class="bot-avatar">✦</div>
            <div>
              <strong>FreshFind Assistant</strong>
              <small><span class="online-indicator"></span> Always Ready to Help</small>
            </div>
          </div>
          <button id="closeChatbot" class="chat-close" aria-label="Close chatbot">&times;</button>
        </div>

        <div class="chatbot-messages" id="chatMessages">
          <div class="bot-message">
            Hi! I'm your FreshFind Assistant. How can I help you find fresh local produce and markets today?
          </div>
        </div>

        <div class="quick-replies" id="chatbotQuickReplies">
          <button data-query="Find a market">Find a market</button>
          <button data-query="Markets open today">Markets open today</button>
          <button data-query="What produce is in season?">What produce is in season?</button>
          <button data-query="Where can I find tomatoes?">Where can I find tomatoes?</button>
          <button data-query="Show Saturday markets">Show Saturday markets</button>
          <button data-query="How does FreshFind work?">How does FreshFind work?</button>
        </div>

        <form class="chat-input-area" id="chatForm">
          <input
            type="text"
            id="chatInput"
            placeholder="Ask about markets, produce, seasons..."
            autocomplete="off"
            required
          />
          <button type="submit" aria-label="Send message">➤</button>
        </form>
      `;
      document.body.appendChild(chatWin);
    }

    setupChatbotEvents();
  }

  function setupChatbotEvents() {
    const launcher = document.getElementById("chatbotLauncher");
    const chatWin = document.getElementById("chatbotWindow");
    const closeBtn = document.getElementById("closeChatbot");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const repliesContainer = document.getElementById("chatbotQuickReplies");

    if (launcher && chatWin) {
      launcher.addEventListener("click", () => {
        chatWin.classList.toggle("open");
        if (chatWin.classList.contains("open")) {
          input.focus();
        }
      });
    }

    if (closeBtn && chatWin) {
      closeBtn.addEventListener("click", () => {
        chatWin.classList.remove("open");
      });
    }

    if (repliesContainer) {
      repliesContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const query = btn.dataset.query || btn.textContent.trim();
        handleUserMessage(query);
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        handleUserMessage(text);
      });
    }
  }

  function appendMessage(text, sender, links) {
    const messages = document.getElementById("chatMessages");
    if (!messages) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-message" : "bot-message";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-text";
    contentDiv.textContent = text;
    msgDiv.appendChild(contentDiv);

    if (links && Array.isArray(links) && links.length > 0) {
      const linksContainer = document.createElement("div");
      linksContainer.className = "chat-related-links";
      links.forEach((l) => {
        const linkBtn = document.createElement("a");
        linkBtn.href = l.url;
        linkBtn.className = "chat-action-link";
        linkBtn.textContent = l.label || l.title || "View Details";
        linksContainer.appendChild(linkBtn);
      });
      msgDiv.appendChild(linksContainer);
    }

    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  async function handleUserMessage(userQuery) {
    appendMessage(userQuery, "user");

    const messages = document.getElementById("chatMessages");
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "bot-message bot-typing";
    typingIndicator.innerHTML = `<span></span><span></span><span></span>`;
    messages.appendChild(typingIndicator);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      if (typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }
      processAssistantResponse(userQuery);
    }, 450);
  }

  function processAssistantResponse(query) {
    const normalized = query.toLowerCase().replace(/[?!.,]/g, " ").trim();

    if (!chatbotData) {
      appendMessage(
        "I'm here to help you discover local markets and fresh produce! Try checking out our Market Directory or Produce Guide.",
        "bot",
        [
          { label: "Market Directory", url: "markets.html" },
          { label: "Produce Guide", url: "produce.html" }
        ]
      );
      return;
    }

    // Check specific dynamic cases first
    // 1. "Markets open today"
    if (normalized.includes("open today") || normalized.includes("open now") || normalized.includes("today market")) {
      const openMarkets = [];
      if (marketsData && window.FreshFind && window.FreshFind.isMarketOpen) {
        Object.values(marketsData).forEach((m) => {
          const status = window.FreshFind.isMarketOpen(m);
          if (status.code === "open" || status.code === "soon") {
            openMarkets.push(m);
          }
        });
      }

      if (openMarkets.length > 0) {
        const names = openMarkets.map((m) => m.name).join(", ");
        appendMessage(
          `We found ${openMarkets.length} market(s) open or opening soon today: ${names}. Check them out below:`,
          "bot",
          openMarkets.map((m) => ({ label: `View ${m.name}`, url: `market-details.html?id=${m.id}` }))
        );
        return;
      } else {
        appendMessage(
          "No markets are open at this exact moment today, but several will be open soon or on scheduled upcoming days! Explore the full schedule in the Directory.",
          "bot",
          [{ label: "Open Market Directory", url: "markets.html" }]
        );
        return;
      }
    }

    // 2. "What produce is in season?"
    if (normalized.includes("season") || normalized.includes("seasonal")) {
      let seasonName = "Current Season";
      if (window.FreshFind && window.FreshFind.getCurrentSeason) {
        seasonName = window.FreshFind.getCurrentSeason().name;
      }
      appendMessage(
        `It's currently ${seasonName}! Peak seasonal picks include fresh vegetables and orchard fruits. Visit our Produce Guide for comprehensive seasonal recommendations.`,
        "bot",
        [
          { label: `Explore ${seasonName} Produce`, url: "produce.html" },
          { label: "Find Markets Near You", url: "markets.html" }
        ]
      );
      return;
    }

    // 3. Match against intents in chatbot.json
    let bestMatch = null;
    let maxMatchedKeywords = 0;

    chatbotData.intents.forEach((intent) => {
      let matchCount = 0;
      intent.keywords.forEach((kw) => {
        if (normalized.includes(kw.toLowerCase())) {
          matchCount += 1;
        }
      });
      if (matchCount > maxMatchedKeywords) {
        maxMatchedKeywords = matchCount;
        bestMatch = intent;
      }
    });

    if (bestMatch && maxMatchedKeywords > 0) {
      appendMessage(bestMatch.response, "bot", bestMatch.links);
      return;
    }

    // Fallback response as required by section 38
    const fallback = chatbotData.fallback || {
      response:
        "I'm sorry, I couldn't find an exact answer. Try asking about markets, opening hours, produce, seasons, or locations.",
      links: [
        { label: "Market Directory", url: "markets.html" },
        { label: "Produce Guide", url: "produce.html" },
        { label: "About FreshFind", url: "about.html" }
      ]
    };
    appendMessage(fallback.response, "bot", fallback.links);
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    loadData();
    injectChatbotDOM();
  });

})(window);
