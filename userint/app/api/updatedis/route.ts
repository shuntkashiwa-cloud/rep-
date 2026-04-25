import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {
  const emos = ["\u0031", "\u0032", "\u0033", "\u0034", "\u0035", "\u0036", "\u0037"].map((num) => encodeURIComponent(num + "\ufe0f\u20E3"));

  const subday = await req.json()
  const all = subday.disbuf
  const hue = subday.hue
  const heri = subday.heri
  let nowbuf = new Date();
  nowbuf.setDate(nowbuf.getDate() - nowbuf.getDay());
  const now = 31 * nowbuf.getMonth() + nowbuf.getDate();
  nowbuf.setDate(nowbuf.getDate() - 7);
  const last = 31 * nowbuf.getMonth() + nowbuf.getDate();
  const { data, error } = await supabase.from("messageid").select().order("id", { ascending: true });
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
  }

  if (!data) return NextResponse.json({ message: "No data found" }, { status: 404 });
  const ind = data.findIndex((item) => item.date == now);
  console.log(data, ind, now);
  if (ind !== -1) {
    const res = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages${data[ind].messageid ? `/${data[ind].messageid}` : ''}`, {
      method: `${data[ind].messageid ? "PATCH" : "POST"}`,
      headers: header,
      body: JSON.stringify({
        content: `今週の出欠です。残留したい曜日に対応する番号でリアクションしてください。\n${all.map((day: number) => day !== 0 ? `${day}:${["月", "火", "水", "木", "金", "土", "日"][day - 1]}` : "").join("　")}`
      })
    });
    const resres = await res.json();
    console.log(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages${data[ind].messageid ? `/${data[ind].messageid}` : ''}`);
    for (const day of hue) {
      if (day !== 0) await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${resres.id}/reactions/${emos[day - 1]}/@me`, { method: "PUT", headers: header });
    }
    for (const day of heri) {
      if (day !== 0) await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${resres.id}/reactions/${emos[day - 1]}`, { method: "DELETE", headers: header });
    }
  }
  const ind2 = data.findIndex((item) => item.date == last);
  if(ind2!==-1 && (all[0]==0 || heri[0]==0)){
    const mescont = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${data[ind2].messageid}`, {
      method: "GET",
      headers: header
    }).then((res) => res.json()).then((res) => res.content);
    let bun,type;
    if(mescont.slice(-3)==="7:日" && heri[0]==0){
      bun=mescont.slice(0, -4);
      type = "DELETE";
    }
    if(mescont.slice(-3)!=="7:日" && hue[0]==0){
      bun=mescont + "　7:日";
      type = "PUT"; 
    }
    const res=await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages${data[ind2].messageid ? "/" + data[ind2].messageid : ''}`, {
      method: (data[ind2].messageid ?"PATCH" : "POST"),
      headers: header,
      body: JSON.stringify({content: bun})
    }).then((res) => res.json()).then((res) => res.id);

    await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${res}/reactions/${encodeURIComponent(emos[6])}/@me`, { method: "PUT", headers: header });
  }

  return NextResponse.json({ message: subday });
}