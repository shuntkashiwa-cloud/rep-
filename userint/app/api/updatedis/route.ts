import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {
  const subday=await req.json()
  
  return NextResponse.json({ message: subday });
}