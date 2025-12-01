import React from "react";

export default function Header() {
  return (
    <header className="p-4 bg-white shadow flex items-center justify-between">
      <h1 className="text-xl font-semibold">AOI Creator</h1>

      <div className="flex items-center gap-3">
        {/* Existing demo button */}
        <button className="px-3 py-1 rounded bg-sky-600 text-white">
          Demo
        </button>

        {/* 🔥 Required button for Playwright test */}
        <button
          id="start-draw"
          className="px-3 py-1 rounded bg-green-600 text-white"
          onClick={() => window.dispatchEvent(new CustomEvent("start-draw"))}
        >
          Start Draw
        </button>
      </div>
    </header>
  );
}
