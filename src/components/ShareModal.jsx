import React from "react";
import { useModals } from "../context/ModalContext";

export default function ShareModal() {
  const { shareData, closeShare, showToast } = useModals();

  if (!shareData.isOpen) return null;

  const encodedUrl = encodeURIComponent(shareData.url || window.location.href);
  const encodedText = encodeURIComponent(
    `${shareData.title || "FreshFind"} - ${shareData.text || "Check this out!"}`
  );

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareData.url || window.location.href)
      .then(() => {
        showToast("Link copied to clipboard!", "success");
      })
      .catch(() => {
        showToast("Could not copy link automatically", "info");
      });
  };

  return (
    <div className="modal-overlay open" onClick={closeShare} id="freshfindShareModal">
      <div
        className="modal-box share-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={closeShare}
          aria-label="Close share dialog"
        >
          &times;
        </button>
        <div className="modal-header-icon">🔗</div>
        <h3>Share with Friends</h3>
        <p className="share-subtitle">
          Spread the word about local fresh markets
        </p>

        <div className="share-actions-grid">
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-wa"
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-fb"
          >
            <span>f</span> Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn share-tw"
          >
            <span>𝕏</span> X (Twitter)
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="share-btn share-copy"
          >
            <span>📋</span> Copy Link
          </button>
        </div>

        <div className="share-input-wrapper">
          <input
            type="text"
            readOnly
            value={shareData.url || window.location.href}
            onClick={(e) => e.target.select()}
          />
        </div>
      </div>
    </div>
  );
}
