"use client";

import { useEffect } from "react";

export default function SimulatorEngine() {
  useEffect(() => {
    // Run the simulation API immediately and then every 10 seconds
    // This allows the app to update data independently of Python,
    // only while the dashboard is open.
    const runSimulation = async () => {
      try {
        await fetch("/api/simulate");
      } catch (err) {
        console.error("Simulation failed:", err);
      }
    };

    runSimulation();
    const interval = setInterval(runSimulation, 10000);

    return () => clearInterval(interval);
  }, []);

  return null; // Hidden component
}
