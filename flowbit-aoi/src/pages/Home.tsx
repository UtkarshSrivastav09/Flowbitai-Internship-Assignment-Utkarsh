import React from "react";
import MapView from "../components/MapView";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MapView />
      </main>
      <footer className="mt-4 text-center text-xs faded p-4">
        Flowbit AOI — Frontend Engineer Intern Submission — Utkarsh Srivastav
      </footer>
    </div>
  );
}
