import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PRICE_THRESHOLD = 7.0;
let currentUnitPrice = 8.0;

export async function GET() {
  try {
    // 1. Fetch devices
    const { data: devices } = await supabase.from("devices").select("*");
    if (!devices || devices.length === 0) {
      return NextResponse.json({ error: "No devices found" }, { status: 404 });
    }

    // 2. Fluctuate global price
    const priceDelta = (Math.random() * 1.6) - 0.8;
    if (Math.random() < 0.15) {
      currentUnitPrice = 11 + Math.random() * 4; // Peak price
    } else if (Math.random() < 0.1) {
      currentUnitPrice = 5 + Math.random() * 2; // Low price
    } else {
      currentUnitPrice = Math.max(5, Math.min(15, currentUnitPrice + priceDelta));
    }

    let totalWattage = 0;
    const telemetryRows = [];
    const aiSuggestions = [];

    // 3. Process devices
    for (const device of devices) {
      if (!device.status) continue;

      let wattage = device.base_consumption;
      
      // Add natural fluctuation
      wattage = wattage * (0.8 + Math.random() * 0.4); 

      // 8% chance of anomaly spike for High-Load devices
      if (device.category === "High-Load" && Math.random() < 0.08) {
        wattage = wattage * (1.5 + Math.random() * 0.5);
      }

      totalWattage += wattage;

      // Update device ONLY with UPDATE query
      await supabase
        .from("devices")
        .update({ current_draw: Math.round(wattage) })
        .eq("id", device.id);

      telemetryRows.push({
        device_id: device.id,
        wattage: Math.round(wattage),
        voltage: Math.round(218 + Math.random() * 10),
        unit_price: Number(currentUnitPrice.toFixed(2))
      });

      // 4. AI Agent Logic (Suggestions, NOT Forced Actions)
      if (currentUnitPrice > PRICE_THRESHOLD && device.category === "High-Load") {
        const hoursFraction = 10 / 3600;
        const savings = (wattage / 1000) * hoursFraction * currentUnitPrice;
        
        aiSuggestions.push({
          action_desc: `💡 High electricity price detected (₹${currentUnitPrice.toFixed(1)}/kWh). Consider turning off ${device.name} to save ₹${savings.toFixed(3)}.`,
          money_saved: 0 // Suggestion only, no real savings yet
        });
      }
    }

    // If unit price normalizes, insert a normalization log occasionally 
    if (currentUnitPrice <= PRICE_THRESHOLD && Math.random() < 0.1) {
      aiSuggestions.push({
        action_desc: `🟢 Price normalized (₹${currentUnitPrice.toFixed(1)}/kWh). Good time to run high-load devices.`,
        money_saved: 0
      });
    }

    // Insert telemetry (History limited via cleanup next)
    if (telemetryRows.length > 0) {
      await supabase.from("telemetry_logs").insert(telemetryRows);
    }

    // Insert AI Logs (Suggestions only)
    if (aiSuggestions.length > 0) {
      // Limit suggestion spam by only inserting one randomly picked suggestion per tick if many exist
      const suggestionToInsert = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      await supabase.from("ai_actions").insert([suggestionToInsert]);
    }

    // 5. Cleanup Database Bloat
    const { data: latestLogs } = await supabase
      .from("telemetry_logs")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(100);

    if (latestLogs && latestLogs.length === 100) {
      // Find IDs that are NOT in the latest 100
      const idsToKeep = latestLogs.map(log => log.id);
      await supabase
        .from("telemetry_logs")
        .delete()
        .not("id", "in", `(${idsToKeep.join(",")})`);
    }

    // Cleanup AI actions bloat
    const { data: latestActions } = await supabase
      .from("ai_actions")
      .select("id")
      .order("timestamp", { ascending: false })
      .limit(50);
      
    if (latestActions && latestActions.length === 50) {
      const idsToKeep = latestActions.map(action => action.id);
      await supabase
        .from("ai_actions")
        .delete()
        .not("id", "in", `(${idsToKeep.join(",")})`);
    }

    return NextResponse.json({ success: true, processed: telemetryRows.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
