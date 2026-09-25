import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext";
import { BookmarkProvider } from "./context/BookmarkContext";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import ShareModal from "./components/ShareModal";
import ProduceModal from "./components/ProduceModal";
import ToastContainer from "./components/ToastContainer";

import Home from "./pages/Home";
import Markets from "./pages/Markets";
import MarketDetails from "./pages/MarketDetails";
import Produce from "./pages/Produce";
import Bookmarks from "./pages/Bookmarks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Guide from "./pages/Guide";
import SignIn from "./pages/SignIn";

export default function App() {
  return (
    <ModalProvider>
      <BookmarkProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/markets/:id" element={<MarketDetails />} />
            <Route path="/produce" element={<Produce />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
          <Chatbot />
          <LoginModal />
          <SignupModal />
          <ShareModal />
          <ProduceModal />
          <ToastContainer />
        </BrowserRouter>
      </BookmarkProvider>
    </ModalProvider>
  );
}
