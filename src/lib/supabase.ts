import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Device {
  id: string;
  name: string;
  category: 'High-Load' | 'Essential';
  status: boolean;
  is_eco_mode: boolean;
  current_draw: number;
  base_consumption: number;
  icon: string;
}

export interface TelemetryLog {
  id: string;
  device_id: string;
  wattage: number;
  voltage: number;
  unit_price: number;
  created_at: string;
}

export interface AIAction {
  id: string;
  action_desc: string;
  money_saved: number;
  timestamp: string;
}
