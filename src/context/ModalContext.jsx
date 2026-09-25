import React, { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [shareData, setShareData] = useState({
    isOpen: false,
    title: "",
    text: "",
    url: ""
  });
  const [produceModalItem, setProduceModalItem] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openLogin = useCallback(() => {
    setSignupOpen(false);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
  }, []);

  const openSignup = useCallback(() => {
    setLoginOpen(false);
    setSignupOpen(true);
  }, []);

  const closeSignup = useCallback(() => {
    setSignupOpen(false);
  }, []);

  const openShare = useCallback((title, text, url) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || "FreshFind | Fresh All Along";
    const shareText = text || "Check out this fresh local produce and farmers market on FreshFind!";

    if (navigator.share) {
      navigator
        .share({ title: shareTitle, text: shareText, url: shareUrl })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setShareData({
              isOpen: true,
              title: shareTitle,
              text: shareText,
              url: shareUrl
            });
          }
        });
    } else {
      setShareData({
        isOpen: true,
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
    }
  }, []);

  const closeShare = useCallback(() => {
    setShareData((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openProduceModal = useCallback((item) => {
    setProduceModalItem(item);
  }, []);

  const closeProduceModal = useCallback(() => {
    setProduceModalItem(null);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        loginOpen,
        openLogin,
        closeLogin,
        signupOpen,
        openSignup,
        closeSignup,
        shareData,
        openShare,
        closeShare,
        produceModalItem,
        openProduceModal,
        closeProduceModal,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
