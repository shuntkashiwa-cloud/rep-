import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {
  const { data: iit, error } = await supabase.from("scheduler").select("time").order("id", { ascending: true });
}