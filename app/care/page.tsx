"use client";
import TimeUI from "@/components/timeui";
import { use, useEffect, useRef, useState } from "react";
export default function Home() {
  const shuryo = ["すべて17時", "すべて14時", "すべて一括で指定", "個別で指定"]
  const nowmonth = new Date().getMonth()
  const nowdate = new Date().getDate()

  const [scheduler, setScheduler] = useState<(boolean | number)[][]>(new Array(12).fill(0).map((_, ind) => new Array(new Date(new Date().getFullYear(), (ind + 1) % 12, 0).getDate()).fill(false)));
  const [firstDay, setFirstDay] = useState(new Date(new Date().getFullYear(), nowmonth, 1));
  const [shuryoType, setShuryoType] = useState(0);
  const [shuryoopend, setShuryoopend] = useState(false);
  const [kboetunum, setKobetunum] = useState(31);
  const [iskobeopend, setIskobeopend] = useState(false);
  const [unseen, setunseen] = useState(false);
  const unseto = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fday = firstDay.getDay();

  const popupref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleclick = (e: MouseEvent) => {
      const contain = popupref.current
      if (contain && !contain.contains(e.target as Node)) {
        setIskobeopend(false);
        unseto.current = setTimeout(() => { setunseen(false) }, 300);
      }
    }
    document.addEventListener("mousedown", handleclick);
    return () => {
      document.removeEventListener("mousedown", handleclick)
    }
  }, [])

  const setalltime = (time: number) => {
    setScheduler(prev => {
      return prev.map((i) => (i.map((l) => (l ? time : false))))
    })
  }

  const setblue = (index: number, numm?: number) => {
    console.log(numm);
    setScheduler(prev => {
      const newScheduler = structuredClone(prev);
      newScheduler[firstDay.getMonth()][index] = (newScheduler[firstDay.getMonth()][index] === false || numm ? numm || (17 * 60) : false);
      return newScheduler;
    })
  }

  return (
    <div className="**:transition **:duration-200 flex flex-col min-h-screen items-center gap-4 bg-zinc-50 text-black" onClick={() => { if (shuryoopend) setShuryoopend(false); }}>
      <h1 className="text-xl mt-2">音楽部残留予定</h1>
      <div className="w-100 bg-white p-4 rounded shadow pb-40 mb-10">
        <p className="text-lg mb-2">活動日</p>
        <div className="shadow flex flex-col gap-1 items-center size-fit bg-white outline-1 outline-gray-300 rounded ">
          <div className="flex items-center">
            <button disabled={firstDay.getMonth() === nowmonth} onClick={() => {
              let newdate = new Date(firstDay);
              newdate.setMonth(firstDay.getMonth() - 1);
              setFirstDay(newdate)
            }} className={`px-2 py-1 rounded disabled:text-gray-400 enabled:hover:bg-gray-300`}>{"<"}</button>
            <h2 className="text-base mx-5">{firstDay.getFullYear()}年{firstDay.getMonth() + 1}月</h2>
            <button disabled={firstDay.getMonth() === (nowmonth + 11) % 12} onClick={() => {
              let newdate = new Date(firstDay);
              newdate.setMonth(firstDay.getMonth() + 1);
              setFirstDay(newdate)
            }} className={`px-2 py-1 rounded disabled:text-gray-400 enabled:hover:bg-gray-300`}>{">"}</button>
          </div>
          <div className="w-80 grid grid-cols-7 justify-around items-center text-sm">
            {["日", "月", "火", "水", "木", "金", "土"].map((i, index) => (<p className={`text-center aspect-square ${index === 0 ? 'text-ore' : ''}`} style={{ lineHeight: `${(75 / 7 / 4).toFixed(2)}rem` }} key={index}>{i}</p>))}
            {new Array(firstDay.getDay()).fill(0).map((_, index) => (<p className={`text-center aspect-square text-gray-400`} style={{ lineHeight: `${(80 / 7 / 4)}rem` }} key={index}>{index - firstDay.getDay() + 1 + scheduler[(firstDay.getMonth() + 11) % 12].length}</p>))}
            {scheduler[firstDay.getMonth()].map((i, index) => (<p className={`${(nowmonth === firstDay.getMonth() && index + 1 < nowdate) ? "text-gray-400" : "cursor-pointer"} text-center aspect-square rounded-full ${(!i && (index + 1 >= nowdate || firstDay.getMonth() != nowmonth)) ? "hover:bg-gray-200" : ""} m-[0.12rem] ${(index + fday) % 7 === 0 ? ' text-ore' : ''} ${i ? "bg-sky-700 text-white hover:bg-[oklch(0.544_0.146_242.358)]" : ""} `} style={{ lineHeight: `${(80 / 7 / 4) - 0.24}rem` }} key={index} onClick={() => { if (index + 1 >= nowdate || firstDay.getMonth() != nowmonth) setblue(index) }}>{index + 1}</p>))}
          </div>
        </div>
        <p className="text-lg mb-2 mt-5">通常活動の終了時刻</p>
        <div className={`relative w-40 border border-gray-300 p-2 hover:border-sky-700 ${shuryoopend ? 'border-sky-700' : ''} cursor-pointer`}>
          <div onClick={() => setShuryoopend(prev => !prev)}>
            <p className="text-sm">{shuryo[shuryoType]}</p>
            <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition duration-400! ${shuryoopend ? "-rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={`absolute z-20 top-full left-0 w-full bg-gray-100 border border-gray-300 rounded mt-1 shadow-lg duration-400! ${shuryoopend ? '' : 'opacity-0 scale-70 -translate-y-[15%] pointer-events-none'}`}>
            {shuryo.map((i, index) => (
              <p key={index} className={`text-sm p-2 hover:bg-gray-200 cursor-pointer ${index === shuryoType ? 'border border-sky-700' : ''}`} onClick={() => {
                setShuryoType(index);
                setShuryoopend(false);
                if (index === 0) setalltime(17 * 60);
                if (index === 1) setalltime(14 * 60);
              }}>{i}</p>
            ))}</div>
        </div>
        {shuryoType === 2 || shuryoType === 3 ? <p className="text-lg mb-2 mt-5">時刻を指定</p> : null}
        {shuryoType === 3 && (
          <div className="relative">
            <div className="w-80 grid grid-cols-7 justify-around items-center text-sm">
              {["日", "月", "火", "水", "木", "金", "土"].map((i, index) => (<p className={`text-center aspect-square ${index === 0 ? 'text-ore' : ''}`} style={{ lineHeight: `${(75 / 7 / 4).toFixed(2)}rem` }} key={index}>{i}</p>))}
              {new Array(firstDay.getDay()).fill(0).map((_, index) => (<p className={`text-center aspect-square text-gray-400`} style={{ lineHeight: `${(80 / 7 / 4)}rem` }} key={index}>{index - firstDay.getDay() + 1 + scheduler[(firstDay.getMonth() + 11) % 12].length}</p>))}
              {scheduler[firstDay.getMonth()].map((i, index) => (<div key={index} className={`relative rounded-full m-[0.12rem]  ${i ? "cursor-pointer bg-sky-700 text-white hover:bg-[oklch(0.544_0.146_242.358)]" : ""}`} onClick={() => {
                if (i) {
                  setunseen(true);
                  setKobetunum(index);
                  setTimeout(() => { setIskobeopend(true) }, 10)
                  clearTimeout(unseto.current);
                  console.log(typeof scheduler[kboetunum]);
                }
              }}><p className={`text-center aspect-square pt-2 rounded-full ${(index + fday) % 7 === 0 ? ' text-ore' : ''}`} key={index}>{index + 1}</p><p className="absolute top-6 text-white text-xs right-1/2 translate-x-1/2">{(typeof i == "number" && `${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, "0")}`)}</p></div>))}
            </div>
            <div hidden={!unseen} ref={popupref} className={`${iskobeopend ? "" : "opacity-0 scale-70 translate-y-[15%]"} border border-gray-300 absolute -translate-x-1/2 bg-neutral-100 pt-4 pl-6 pr-8 pb-6 w-fit shadow-lg`} style={{ left: `${(fday + kboetunum + 1) % 7 * (80 * 4 / 7) - 80 * 2 / 7}px`, bottom: `${(Math.ceil((fday + scheduler[firstDay.getMonth()].length) / 7) - Math.ceil((fday + kboetunum + 1) / 7) + 1) * (80 * 4 / 7) + 16}px` }}><TimeUI key={kboetunum} type="w" defo={scheduler[firstDay.getMonth()][kboetunum] as number} settime={(i) => { setblue(kboetunum, i) }} />
              <svg viewBox="0 0 28 28" className="w-7 h-7 absolute -bottom-7 left-1/2 -translate-x-1/2">
                <path d="M0 0L14 16 L28 0Z " className="fill-neutral-100 stroke-1 stroke-gray-300"></path>
                <path d="M1 0L27 0" className="stroke-neutral-100"></path></svg>
              <button className="absolute right-2 bottom-2 w-10 h-10 bg-sky-700 text-white rounded-full border border-sky-700 hover:bg-white hover:text-sky-700" onClick={() => {
                setIskobeopend(false);
                unseto.current = setTimeout(() => { setunseen(false) }, 300);
              }}>✔</button>
            </div>
          </div>
        )}
        {shuryoType === 2 && <TimeUI settime={setalltime} />}
      </div>
    </div>
  )
}