import { NextResponse} from "next/server";
export async function POST(request: Request) {
    const data = await request.json();
    const mesage=await fetch(process.env.GAS_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d=await mesage.json();
    return NextResponse.json({ message: JSON.stringify(d) });
}