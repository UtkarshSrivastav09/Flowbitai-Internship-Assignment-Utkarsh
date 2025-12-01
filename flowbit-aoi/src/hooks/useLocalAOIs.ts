import { useState, useEffect } from "react";

const KEY = "flowbit_aoi_v1";
export function useLocalAOIs() {
  const [aois, setAoIs] = useState<any[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setAoIs(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(aois));
  }, [aois]);

  return { aois, setAoIs };
}
