"use client";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  );
}
