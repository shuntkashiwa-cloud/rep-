import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {
  const { data: iit, error } = await supabase.from("scheduler").select("time").order("id", { ascending: true });
  if (!iit) return NextResponse.json({ message: "No data found" }, { status: 404 });
  const now = new Date();
  const current = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 1000 / 60 / 60 / 24) + Number(new Date(now.getFullYear(), 2, 0).getDate() == 28 && now.getMonth() >= 2);
  let buf = new Array();
  let bufsupa = new Array();
  let j = 0;
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
  }
  const emos = ["\u0031", "\u0032", "\u0033", "\u0034", "\u0035", "\u0036", "\u0037"].map((num) => encodeURIComponent(num + "\ufe0f\u20E3"));

  for (let i = 1; i < 8; i++) {
    if (new Date(now.getFullYear(), 2, 0).getDate() == 28 && i + current + j == 59) j = 1;
    if (iit[(i + current + j)%366].time) {
      buf.push(i);
      bufsupa.push({ "id": i + current + j, "time": iit[(i + current + j)%366].time });
    }
  }
  const res = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: header,
    body: JSON.stringify({
      content: `今週の出欠です。残留したい曜日に対応する番号でリアクションしてください。\n${buf.map((day) => `${day}:${["月", "火", "水", "木", "金", "土", "日"][day - 1]}`).join("　")}`
    })
  });
  const sleep = (value: number) => { return new Promise((resolve) => setTimeout(resolve, value)) };

  const resres = await res.json();
  for (const day of buf) {
    await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${resres.id}/reactions/${emos[day - 1]}/@me`, {
      method: "PUT",
      headers: header
    });
    await sleep(100);
  }
  const oldid=await supabase.from("messageid").select().eq("id", 0).single()
  if (oldid.data){
    await supabase.from("messageid").update({ id: 0, messageid: oldid.data.messageid,date:31*now.getMonth()+now.getDate()}).eq("id", 0);
  }
  await supabase.from("messageid").update({ id: 1, messageid: resres.id ,date:31*now.getMonth()+now.getDate()}).eq("id", 1);

  const mesage = await fetch(process.env.GAS_URL!, { method: "POST", headers: header, body: JSON.stringify(bufsupa) });
  const d = await mesage.json();
  return NextResponse.json({ message: d});
}
