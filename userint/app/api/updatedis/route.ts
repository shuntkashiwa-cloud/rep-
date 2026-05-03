import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
import { AuthWeakPasswordError } from '@supabase/supabase-js';
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
    "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    "User-Agent": "OngakubuBot (https://github.com/yourname/repo, 1.0)"
  }
  const sleep = (value: number) => { return new Promise((resolve) => setTimeout(resolve, value)) };

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
    for (const day of all) {
      await sleep(100);
      if (day !== 0) await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${resres.id}/reactions/${emos[day - 1]}/@me`, { method: "PUT", headers: header });
    }
    for (const day of heri) {
      await sleep(100);
      if (day !== 0) console.log(await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${resres.id}/reactions/${emos[day - 1]}`, { method: "DELETE", headers: header }));
    }
    await supabase.from("messageid").update({ messageid: resres.id }).eq("id", data[ind].id);
  } else {
    //await fetch("api/senddis", { method: "GET"});
  }

  //先週の日曜
  console.log(last);
  const ind2 = data.findIndex((item) => item.date == last);
  if (all[0] == 0 || heri[0] == 0) {
    let bun, type;
    let mescont = null;
    if (ind2 !== -1) {
      mescont = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${data[ind2].messageid}`, {
        method: "GET",
        headers: header
      }).then((res) => res.json()).then((res) => res.content);
      
      if (mescont) {
        if (mescont.slice(-3) === "7:日" && heri[0] == 0) {
          bun = mescont.slice(0, -4);
          if(!bun.includes(":")) bun="";
          type = "DELETE";
        }
        if (mescont.slice(-3) !== "7:日" && hue[0] == 0) {
          bun = mescont + "　7:日";
          type = "PUT";
        }
      }
    }
    if (!mescont) {
      bun = `今日の出欠です。番号でリアクションしてください。\n7:日`;
      type = "PUT";
    }
    console.log(mescont);
    console.log(bun)

    const r = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages${mescont ? "/" + data[ind2].messageid : ''}`, {
      method: (mescont ? "PATCH" : "POST"),
      headers: header,
      body: JSON.stringify({ content: bun })
    })
    const re=await r.json();
    console.log(re);
    const res=re.id;

    await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${res}/reactions/${emos[6]}${type === "PUT" ? "/@me" : ""}`, { method: type, headers: header });
    if(ind2!==-1) {
      await supabase.from("messageid").update({ messageid: res }).eq("id", data[ind2].id);
    } else {
      let buf=structuredClone(data);
      if(data[1].date>last) buf[0]={ id: 0, created_at:"2026-04-20T12:44:35.952741+00:00", messageid: res, date: last };
      else{
        buf[1].id=0;
        buf[0]=buf[1];
        buf[1]={ id: 1, created_at:"2026-04-20T12:44:35.952741+00:00",messageid: res, date: last };
      }
      console.log(buf);
      const a =await supabase.from("messageid").upsert(buf, { onConflict: "id" });
      console.log(a)
    }
  }

  return NextResponse.json({ message: last });
}