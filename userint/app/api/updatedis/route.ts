import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {


  const subday = await req.json()
  const all = subday.disbuf
  const hue = subday.hue
  const heri = subday.heri
  let nowbuf = new Date();
  nowbuf.setDate(nowbuf.getDate() -nowbuf .getDay());
  const now=31*nowbuf.getMonth()+nowbuf.getDate();
  const { data, error } = await supabase.from("messageid").select().order("id", { ascending: true });
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
  }

  if (!data) return NextResponse.json({ message: "No data found" }, { status: 404 });
  if (data[1].date == now) {
    for (const day of hue) {
      await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${data[1].messageid}/reactions/${encodeURIComponent(emos[day] + "\ufe0f\u20E3")}/@me`, {
        method: "PUT",
        headers: header
      });
    }
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: header,
    body: JSON.stringify({
      content: `今週の出欠です。残留したい曜日に対応する番号でリアクションしてください。\n${all.map((day: number) => day !== 0 ? `${day}:${["月", "火", "水", "木", "金", "土", "日"][day - 1]}` : "").join("　")}`
    })
  });
  return NextResponse.json({ message: subday });
}