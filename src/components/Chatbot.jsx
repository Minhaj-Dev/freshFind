import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotData from "../data/chatbot.json";
import marketsData from "../data/markets.json";
import produceData from "../data/produce.json";
import { isMarketOpen, getCurrentSeason } from "../utils/engine";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "initial",
      sender: "bot",
      text: "Hi! I'm your FreshFind Assistant. How can I help you find fresh local produce and markets today?",
      links: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const quickReplies = [
    "Find a market",
    "Markets open today",
    "What produce is in season?",
    "Where can I find tomatoes?",
    "Show Saturday markets",
    "How does FreshFind work?"
  ];

  const handleLinkClick = (url) => {
    setIsOpen(false);
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank");
    } else {
      // Map old html urls to React router paths
      let cleanUrl = url
        .replace("index.html", "/")
        .replace("markets.html", "/markets")
        .replace("produce.html", "/produce")
        .replace("about.html", "/about")
        .replace("contact.html", "/contact")
        .replace("bookmarks.html", "/bookmarks")
        .replace("guide.html", "/guide")
        .replace("market-details.html?id=", "/markets/");
      navigate(cleanUrl);
    }
  };

  const handleUserMessage = (userQuery) => {
    if (!userQuery.trim()) return;

    const userMsg = {
      id: Date.now() + "-user",
      sender: "user",
      text: userQuery,
      links: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      processResponse(userQuery);
    }, 450);
  };

  const processResponse = (query) => {
    const normalized = query.toLowerCase().replace(/[?!.,]/g, " ").trim();

    // 1. "Markets open today" / "open now"
    if (
      normalized.includes("open today") ||
      normalized.includes("open now") ||
      normalized.includes("today market")
    ) {
      const openMarkets = [];
      Object.values(marketsData).forEach((m) => {
        const status = isMarketOpen(m);
        if (status.code === "open" || status.code === "soon") {
          openMarkets.push(m);
        }
      });

      if (openMarkets.length > 0) {
        const names = openMarkets.map((m) => m.name).join(", ");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-bot",
            sender: "bot",
            text: `We found ${openMarkets.length} market(s) open or opening soon today: ${names}. Check them out below:`,
            links: openMarkets.map((m) => ({
              label: `View ${m.name}`,
              url: `/markets/${m.id}`
            }))
          }
        ]);
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-bot",
            sender: "bot",
            text: "No markets are open at this exact moment today, but several will be open soon or on scheduled upcoming days! Explore the full schedule in the Directory.",
            links: [{ label: "Open Market Directory", url: "/markets" }]
          }
        ]);
        return;
      }
    }

    // 2. "What produce is in season?"
    if (normalized.includes("season") || normalized.includes("seasonal")) {
      const season = getCurrentSeason();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-bot",
          sender: "bot",
          text: `It's currently ${season.name}! Peak seasonal picks include fresh vegetables and orchard fruits. Visit our Produce Guide for comprehensive seasonal recommendations.`,
          links: [
            { label: `Explore ${season.name} Produce`, url: "/produce" },
            { label: "Find Markets Near You", url: "/markets" }
          ]
        }
      ]);
      return;
    }

    // 3. Match against intents in chatbot.json
    let bestMatch = null;
    let maxMatchedKeywords = 0;

    if (chatbotData && chatbotData.intents) {
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
    }

    if (bestMatch && maxMatchedKeywords > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-bot",
          sender: "bot",
          text: bestMatch.response,
          links: bestMatch.links || []
        }
      ]);
      return;
    }

    // Fallback response
    const fallback = chatbotData?.fallback || {
      response:
        "I'm sorry, I couldn't find an exact answer. Try asking about markets, opening hours, produce, seasons, or locations.",
      links: [
        { label: "Market Directory", url: "/markets" },
        { label: "Produce Guide", url: "/produce" },
        { label: "About FreshFind", url: "/about" }
      ]
    };

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + "-bot",
        sender: "bot",
        text: fallback.response,
        links: fallback.links || []
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const q = inputValue.trim();
    setInputValue("");
    handleUserMessage(q);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        id="chatbotLauncher"
        className="chatbot-launcher"
        aria-label="Open FreshFind Assistant"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="chat-bubble-icon">💬</span>
        <span className="chat-launcher-label">Need Help?</span>
        <span className="chat-online-pulse"></span>
      </button>

      {/* Chatbot Window */}
      <div
        id="chatbotWindow"
        className={`chatbot-window ${isOpen ? "open" : ""}`}
      >
        <div className="chatbot-header">
          <div className="chatbot-title">
            <div className="bot-avatar">✦</div>
            <div>
              <strong>FreshFind Assistant</strong>
              <small>
                <span className="online-indicator"></span> Always Ready to Help
              </small>
            </div>
          </div>
          <button
            id="closeChatbot"
            className="chat-close"
            aria-label="Close chatbot"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </div>

        <div className="chatbot-messages" id="chatMessages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.sender === "user" ? "user-message" : "bot-message"}
            >
              <div className="message-text">{m.text}</div>
              {m.links && m.links.length > 0 && (
                <div className="chat-related-links">
                  {m.links.map((link, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="chat-action-link"
                      onClick={() => handleLinkClick(link.url)}
                    >
                      {link.label || "View Details"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="bot-message bot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-replies" id="chatbotQuickReplies">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUserMessage(qr)}
            >
              {qr}
            </button>
          ))}
        </div>

        <form className="chat-input-area" id="chatForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="chatInput"
            placeholder="Ask about markets, produce, seasons..."
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" aria-label="Send message">
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
