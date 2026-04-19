import { NextResponse} from "next/server";
export async function POST(request: Request) {
    const data = await request.json();
    const mesage=await fetch(process.env.GAS_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: data });
    const d=await mesage.json();
    return NextResponse.json({ message: d });
}