import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { stat } from "fs";

export async function POST(request: Request) {
  const errormes=[{ message: "No data found" }, { status: 404 }]  as const;
  const { emoji } = await request.json();

  const api="https://discord.com/api/v10";
  const resp = await fetch(`${api}/guilds/${process.env.DISCORD_GUILD_ID}/roles`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    }
  });
  const rolebuf=await resp.json();
  if(!rolebuf) return NextResponse.json(...errormes);
  const roles=new Map<string,string>();
  rolebuf.forEach((role: { id: string, name: string }) => {roles.set(role.id,role.name)});
  
  let nichi=new Date()
  nichi.setDate(nichi.getDate() - nichi.getDay());
  const { data, error } = await supabase.from("messageid").select().order("id", { ascending: true }).eq("date", 31 * nichi.getMonth() + nichi.getDate());
  if(!data) return NextResponse.json(...errormes);
  const messageid=data[data.length-1].messageid;
  if(!messageid) return NextResponse.json(...errormes);

  const rusers = [];
  const rusersset = new Set();
  let after: string = "";
  while (true) {
    const resp = await fetch(`${api}/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${messageid}/reactions/${encodeURIComponent(emoji)}?limit=100${after ? `&after=${after}` : ''}`, {
      method: "GET",
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    });
    const reacmembuf = await resp.json().then((users: { id: string }[]) => users.map((user)=>user.id));
    if (!reacmembuf) return NextResponse.json(...errormes); 
    if (reacmembuf.length === 0) break;
    rusers.push(...reacmembuf);
    reacmembuf.forEach((id) => rusersset.add(id));
    if (reacmembuf.length < 100) break;
    after = reacmembuf[reacmembuf.length - 1];
  } 

  const cohort = /^(\d+)(期|th)$/i;
  const resmem=await fetch(`${api}/guilds/${process.env.DISCORD_GUILD_ID}/members`, {
    method: "GET",
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
  });
  const members = await resmem.json();
  if (!members) return NextResponse.json(...errormes);
  const gene=members.filter((member:{user:{id:string}})=>rusersset.has(member.user.id)).map((member:{roles:string[]})=>{const a=member.roles.filter(role=>cohort.test(roles.get(role) || ""));return(a.length==0 ? null : parseInt(roles.get(a[0])!.match(cohort)![1]))});

  return NextResponse.json({gene,rusers});
}