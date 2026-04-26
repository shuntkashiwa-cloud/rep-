export async function POST(req: Request) {
  const header = {
    "Content-Type": "application/json",
    "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
  }
  const mescont = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${null}`, {
        method: "GET",
        headers: header
      }).then((res) => res.json()).then((res) => res.content);

  console.log(mescont);
}