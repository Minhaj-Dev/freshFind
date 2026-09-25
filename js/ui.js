/**
 * FreshFind - UI System & Global Elements
 * Handles:
 * - Real-Time Clock in Top Bar (every second DOM update)
 * - Toast Notification System
 * - Share Modal & Web Share API Fallback
 * - Non-functional Login & Signup Modals
 * - Mobile Hamburger Navigation Drawer
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  /* =========================================================
     1. REAL-TIME CLOCK
  ========================================================= */
  function updateLiveClock() {
    if (typeof document === "undefined" || !document.querySelectorAll) return;
    const clockElements = document.querySelectorAll("#liveClock, .live-clock");
    if (!clockElements.length) return;

    const now = new Date();
    const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
    const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

    const timeStr = now.toLocaleTimeString("en-US", timeOptions);
    const dateStr = now.toLocaleDateString("en-US", dateOptions);
    const displayText = `Current Time: ${timeStr} • ${dateStr}`;

    clockElements.forEach((el) => {
      el.textContent = displayText;
    });
  }

  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  /* =========================================================
     2. TOAST NOTIFICATIONS
  ========================================================= */
  function showToast(message, type) {
    let container = document.getElementById("freshfindToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "freshfindToastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type || "info"}`;

    let icon = "✦";
    if (type === "success") icon = "✓";
    if (type === "error") icon = "✕";
    if (type === "warning") icon = "⚠";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    container.appendChild(toast);

    const removeToast = () => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    toast.querySelector(".toast-close").addEventListener("click", removeToast);
    setTimeout(removeToast, 4000);
  }

  /* =========================================================
     3. SHARE SYSTEM (WEB SHARE API + MODAL FALLBACK)
  ========================================================= */
  function shareContent(title, text, url) {
    const shareUrl = url || window.location.href;
    const shareTitle = title || "FreshFind | Fresh All Along";
    const shareText = text || "Check out this fresh local produce and farmers market on FreshFind!";

    if (navigator.share) {
      navigator
        .share({ title: shareTitle, text: shareText, url: shareUrl })
        .catch((err) => {
          if (err.name !== "AbortError") {
            openShareModal(shareTitle, shareText, shareUrl);
          }
        });
    } else {
      openShareModal(shareTitle, shareText, shareUrl);
    }
  }

  function openShareModal(title, text, url) {
    let modal = document.getElementById("freshfindShareModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "freshfindShareModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="modal-box share-modal-box">
          <button class="modal-close" id="closeShareModal" aria-label="Close share dialog">&times;</button>
          <div class="modal-header-icon">🔗</div>
          <h3>Share with Friends</h3>
          <p class="share-subtitle" id="shareModalSubtitle">Spread the word about local fresh markets</p>
          <div class="share-actions-grid">
            <a id="shareWa" target="_blank" rel="noopener" class="share-btn share-wa">
              <span>💬</span> WhatsApp
            </a>
            <a id="shareFb" target="_blank" rel="noopener" class="share-btn share-fb">
              <span>f</span> Facebook
            </a>
            <a id="shareTw" target="_blank" rel="noopener" class="share-btn share-tw">
              <span>𝕏</span> X (Twitter)
            </a>
            <button id="shareCopy" class="share-btn share-copy">
              <span>📋</span> Copy Link
            </button>
          </div>
          <div class="share-input-wrapper">
            <input type="text" id="shareLinkInput" readonly />
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#closeShareModal").addEventListener("click", () => {
        modal.classList.remove("open");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
      });
      modal.querySelector("#shareCopy").addEventListener("click", () => {
        const input = modal.querySelector("#shareLinkInput");
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
          showToast("Link copied to clipboard!", "success");
        });
      });
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title} - ${text}`);

    modal.querySelector("#shareWa").href = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
    modal.querySelector("#shareFb").href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    modal.querySelector("#shareTw").href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    modal.querySelector("#shareLinkInput").value = url;

    modal.classList.add("open");
  }

  /* =========================================================
     4. LOGIN & SIGNUP MODALS (NON-FUNCTIONAL DEMO)
  ========================================================= */
  function openLoginModal() {
    let modal = document.getElementById("loginModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "loginModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="login-modal modal-box">
          <button class="modal-close" id="closeLogin" aria-label="Close modal">&times;</button>
          <div class="modal-logo">F</div>
          <span class="section-kicker">WELCOME TO FRESHFIND</span>
          <h2>Sign in to your <span>FreshFind</span></h2>
          <p>Login to view your saved markets and personalized recommendations.</p>
          <form id="loginForm" class="auth-modal-form">
            <label>
              Email Address
              <input type="email" placeholder="you@example.com" required autocomplete="email" />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" required autocomplete="current-password" />
            </label>
            <button type="submit" class="primary-btn modal-submit">Login</button>
          </form>
          <div class="auth-notice-box">
            <span class="notice-icon">ℹ</span>
            <p>Login/signup is not part of the current FreshFind implementation.</p>
          </div>
          <p class="modal-switch-text">Don't have an account? <a href="#" id="switchToSignup">Create account</a></p>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#closeLogin").addEventListener("click", closeLoginModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeLoginModal();
      });
      modal.querySelector("#switchToSignup").addEventListener("click", (e) => {
        e.preventDefault();
        closeLoginModal();
        openSignupModal();
      });
      modal.querySelector("#loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Login/signup is not part of the current FreshFind implementation.", "warning");
      });
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function openSignupModal() {
    let modal = document.getElementById("signupModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "signupModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="signup-modal modal-box">
          <button class="modal-close" id="closeSignup" aria-label="Close modal">&times;</button>
          <div class="modal-logo">F</div>
          <span class="section-kicker">JOIN FRESHFIND</span>
          <h2>Create your <span>Account</span></h2>
          <p>Sign up to start bookmarking your neighborhood markets.</p>
          <form id="signupForm" class="auth-modal-form">
            <label>
              Full Name
              <input type="text" placeholder="Your name" required />
            </label>
            <label>
              Email Address
              <input type="email" placeholder="you@example.com" required autocomplete="email" />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" required autocomplete="new-password" />
            </label>
            <button type="submit" class="primary-btn modal-submit">Create Account</button>
          </form>
          <div class="auth-notice-box">
            <span class="notice-icon">ℹ</span>
            <p>Login/signup is not part of the current FreshFind implementation.</p>
          </div>
          <p class="modal-switch-text">Already registered? <a href="#" id="switchToLogin">Sign in</a></p>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#closeSignup").addEventListener("click", closeSignupModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeSignupModal();
      });
      modal.querySelector("#switchToLogin").addEventListener("click", (e) => {
        e.preventDefault();
        closeSignupModal();
        openLoginModal();
      });
      modal.querySelector("#signupForm").addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Login/signup is not part of the current FreshFind implementation.", "warning");
      });
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSignupModal() {
    const modal = document.getElementById("signupModal");
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* =========================================================
     5. MOBILE MENU & GLOBAL EVENT LISTENERS
  ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    // Mobile Hamburger
    const menuToggle = document.getElementById("menuToggle");
    const mobileNavDrawer = document.getElementById("mobileNavDrawer");
    const closeMobileNav = document.getElementById("closeMobileNav");

    if (menuToggle && mobileNavDrawer) {
      menuToggle.addEventListener("click", () => {
        mobileNavDrawer.classList.toggle("open");
      });
    }

    if (closeMobileNav && mobileNavDrawer) {
      closeMobileNav.addEventListener("click", () => {
        mobileNavDrawer.classList.remove("open");
      });
    }

    // Bind all Login & Signup buttons across pages
    document.querySelectorAll(".open-login-btn, #loginBtn, [data-modal='login']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openLoginModal();
      });
    });

    document.querySelectorAll(".open-signup-btn, #signupBtn, [data-modal='signup']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openSignupModal();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLoginModal();
        closeSignupModal();
        const shareModal = document.getElementById("freshfindShareModal");
        if (shareModal) shareModal.classList.remove("open");
        if (mobileNavDrawer) mobileNavDrawer.classList.remove("open");
      }
    });
  });

  // Export functions
  FreshFind.showToast = showToast;
  FreshFind.shareContent = shareContent;
  FreshFind.openLoginModal = openLoginModal;
  FreshFind.closeLoginModal = closeLoginModal;
  FreshFind.openSignupModal = openSignupModal;
  FreshFind.closeSignupModal = closeSignupModal;

})(window);
