import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabaseClient";
export async function POST(req: Request) {
  const { data: iit, error } = await supabase.from("scheduler").select("time").order("id", { ascending: true });
  if(!iit) return NextResponse.json({message:"No data found"}, { status: 404 });
  const now=new Date();
  const current = Math.floor((now.getTime()-new Date(now.getFullYear(), 0, 1).getTime())/1000/60/60/24)+Number(new Date(now.getFullYear(),2,0).getDate()==28 && now.getMonth()>=2);
  let buf=new Array();
  let j=0;
  for(let i=0;i<7;i++){
    if(new Date(now.getFullYear(),2,0).getDate()==28 && i+current+j==59) j=1;
    if(iit[i+current+j].time) buf.push(i+current+j);
  }
  await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: JSON.stringify({
      content: `今週の出欠です ${buf.join(", ")},${current}`
    })
  });
  return NextResponse.json({ data: buf });
}
