"use client";
import TimeUI from "@/components/timeui";
import { useEffect, useRef, useState } from "react";
export default function Home() {
  const [scheduler, setScheduler] = useState(new Array(12).fill(0).map((_, ind) => new Array(new Date(new Date().getFullYear(), (ind + 1) % 12, 0).getDate()).fill(false)));
  const [firstDay, setFirstDay] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [shuryoType, setShuryoType] = useState(0);
  const [shuryoopend, setShuryoopend] = useState(false);
  const [ikkatsuTime, setIkkatsuTime] = useState("17:00");

  const fday = firstDay.getDay();
  const shuryo = ["すべて17時", "すべて14時", "すべて一括で指定", "個別で指定"]

  const setblue = (index: number) => {
    return () => setScheduler(prev => {
      const newScheduler = structuredClone(prev);
      newScheduler[firstDay.getMonth()][index] = !newScheduler[firstDay.getMonth()][index];
      return newScheduler;
    })
  }

  return (
    <div className="**:transition **:duration-200 flex flex-col min-h-screen items-center gap-4 bg-zinc-50 text-black" onClick={() => { if (shuryoopend) setShuryoopend(false); }}>
      <h1 className="text-xl mt-2">音楽部残留予定</h1>
      <div className="w-100 bg-white p-4 rounded shadow">
        <p className="text-lg mb-2">活動日</p>
        <div className="shadow flex flex-col gap-1 items-center size-fit bg-white outline outline-1 outline-gray-300 rounded ">
          <div className="flex items-center">
            <button onClick={() => {
              let newdate = new Date(firstDay);
              newdate.setMonth(firstDay.getMonth() - 1);
              setFirstDay(newdate)
            }} className="px-2 py-1 rounded hover:bg-gray-300">{"<"}</button>
            <h2 className="text-base mx-5">{firstDay.getFullYear()}年{firstDay.getMonth() + 1}月</h2>
            <button onClick={() => {
              let newdate = new Date(firstDay);
              newdate.setMonth(firstDay.getMonth() + 1);
              setFirstDay(newdate)
            }} className="px-2 py-1 rounded hover:bg-gray-300">{">"}</button>
          </div>
          <div className="w-80 grid grid-cols-7 justify-around items-center text-sm">
            {["日", "月", "火", "水", "木", "金", "土"].map((i, index) => (<p className={`text-center aspect-square ${index === 0 ? 'text-[oklch(0.563_0.1275_63.83)]' : ''}`} style={{ lineHeight: `${(75 / 7 / 4).toFixed(2)}rem` }} key={index}>{i}</p>))}
            {new Array(firstDay.getDay()).fill(0).map((_, index) => (<p className={`text-center aspect-square text-gray-400`} style={{ lineHeight: `${(80 / 7 / 4)}rem` }} key={index}>{index - firstDay.getDay() + 1 + scheduler[(firstDay.getMonth() + 11) % 12].length}</p>))}
            {scheduler[firstDay.getMonth()].map((i, index) => (<p className={`text-center aspect-square rounded-full ${!i ? "hover:bg-gray-200" : ""} m-[0.12rem] ${(index + fday) % 7 === 0 ? ' text-[oklch(0.563_0.1275_63.83)]' : ''} ${i ? "bg-sky-700 text-white hover:bg-[oklch(0.544_0.146_242.358)]" : ""} `} style={{ lineHeight: `${(80 / 7 / 4) - 0.24}rem` }} key={index} onClick={setblue(index)}>{index + 1}</p>))}
          </div>
        </div>
        <p className="text-lg mb-2 mt-5">通常活動の終了時刻</p>
        <div className={`relative w-40 border border-gray-300 p-2 hover:border-sky-700 ${shuryoopend ? 'border-sky-700' : ''} cursor-pointer`}>
          <div onClick={() => setShuryoopend(prev => !prev)}>
            <p className="text-sm">{shuryo[shuryoType]}</p>
            <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition !duration-400 ${shuryoopend ? "-rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={`absolute top-full left-0 w-full bg-gray-100 border border-gray-300 rounded mt-1 shadow-lg !duration-400 ${shuryoopend ? '' : 'opacity-0 scale-70 -translate-y-[15%] pointer-events-none'}`}>
            {shuryo.map((i, index) => (
              <p key={index} className={`text-sm p-2 hover:bg-gray-200 cursor-pointer ${index === shuryoType ? 'border border-sky-700' : ''}`} onClick={() => {
                setShuryoType(index);
                setShuryoopend(false);
              }}>{i}</p>
            ))}</div>
        </div>
        {shuryoType === 2 || shuryoType === 3 ? <p className="text-lg mb-2 mt-5">時刻を指定</p> : null}
        {shuryoType === 3 && (
          <div className="w-80 grid grid-cols-7 justify-around items-center text-sm">
            {["日", "月", "火", "水", "木", "金", "土"].map((i, index) => (<p className={`text-center aspect-square ${index === 0 ? 'text-[oklch(0.563_0.1275_63.83)]' : ''}`} style={{ lineHeight: `${(75 / 7 / 4).toFixed(2)}rem` }} key={index}>{i}</p>))}
            {new Array(firstDay.getDay()).fill(0).map((_, index) => (<p className={`text-center aspect-square text-gray-400`} style={{ lineHeight: `${(80 / 7 / 4)}rem` }} key={index}>{index - firstDay.getDay() + 1 + scheduler[(firstDay.getMonth() + 11) % 12].length}</p>))}
            {scheduler[firstDay.getMonth()].map((i, index) => (<p className={`text-center aspect-square rounded-full ${!i ? "hover:bg-gray-200" : ""} m-[0.12rem] ${(index + fday) % 7 === 0 ? ' text-[oklch(0.563_0.1275_63.83)]' : ''} ${i ? "bg-sky-700 text-white hover:bg-[oklch(0.544_0.146_242.358)]" : ""} `} style={{ lineHeight: `${(80 / 7 / 4) - 0.24}rem` }} key={index} onClick={setblue(index)}>{index + 1}</p>))}
          </div>
        )}
        {shuryoType === 2 && (<input type="time" className="border border-gray-300 outline-none p-2 focus:border-sky-700 text-sm" step="300" value={ikkatsuTime} onChange={(e) => setIkkatsuTime(e.target.value)} ></input>)}
        <div className="mt-2">
        <TimeUI/></div>
      </div>
    </div>
  )
}