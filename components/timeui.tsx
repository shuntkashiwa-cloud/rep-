"use client";
import { useEffect, useRef, useState } from "react";
type Props={settime:(time:number)=>void; type?:string};
export default function TimeUI({settime,type}:Props) {

  const [hour, setHour] = useState([17, 0]);
  const [dur, setDur] = useState(200);
  const [ikkatsuhover, setIkkatsuhover] = useState([false, false]);

  const scroh = useRef<HTMLDivElement | null>(null);
  const scrom = useRef<HTMLDivElement | null>(null);
  const last = useRef(Date.now());
  const lastdire = useRef(1);
  const lastdur = useRef(200);
  const reserved = useRef(false);
  const opa = ["100", "70", "50", "0"];
  const position = ["-translate-y-[52px]", "-translate-y-[47px]", "-translate-y-[32px]", "-translate-y-[12px]", "translate-y-[8px]", "translate-y-[23px]", "translate-y-[28px]"];
  const scale = ["100", "80", "50", "0"];
  const hourref=useRef([17,0])

  //キー入力での時間変更のための関数。入力値が不正な場合は最後に有効だった値を使用する。
  const lasthour = useRef([17, 0]);
  const count = useRef([0, 0]);
  const [focused, setFocused] = useState([false, false]);
  const pRef = useRef<(HTMLParagraphElement | null)[]>([null, null]);

  const setsethour = (i: number, val: number) => {
    console.log(val);
    let valval = (Number.isNaN(val) ? lasthour.current[i] : val);
    let ret = true;
    if (val >= (24 + 36 * i)) {
      valval = lasthour.current[i];
      ret = false;
    } else {
      valval = Math.max(0, valval);
    }
    lasthour.current[i] = valval;
    setHour(prev => {
      const buf = [...prev];
      buf[i] = valval;
      return buf;
    });
    return ret;
  }

  useEffect(() => {
    const containerh = scroh.current;
    const containerm = scrom.current;
    if (!containerh || !containerm) return;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let iflastscro = false

    const increhour = (i: number, dire: number) => {
      setHour(prev => { const buf = [...prev]; buf[i] = (buf[i] + dire / Math.abs(dire) + 24 + 36 * i) % (24 + 36 * i); return buf });
    }

    const timer = (i: number) => {
      const timeout = Math.max(Date.now() - last.current, lastdur.current);
      if (timeout > 190) {
        reserved.current = false;
        console.log(60*hour[0]+hour[1])
        settime(60*hourref.current[0]+hourref.current[1]);
        return;
      }
      iflastscro = false;
      setDur(timeout);
      increhour(i, lastdire.current)
      setTimeout(() => timer(i), timeout);
    }

    const handleScroll = (e: WheelEvent, i: number) => {
      pRef.current[i]?.focus();
      e.preventDefault();
      lastdur.current = Date.now() - last.current;
      if (!reserved.current) {
        reserved.current = true;
        setDur(200);
        increhour(i, e.deltaY);
        timerId = setTimeout(() => timer(i), 200);
        iflastscro = true;
      } else if (iflastscro && lastdur.current < 50 && timerId) {
        clearTimeout(timerId);
        increhour(i, e.deltaY);
        setDur(lastdur.current);
        timerId = setTimeout(() => timer(i), lastdur.current);
      }
      lastdire.current = e.deltaY / Math.abs(e.deltaY);
      last.current = Date.now();
    }

    const handlehover = (i: number, hover: boolean) => {
      return () => setIkkatsuhover(prev => {
        const buf = [...prev];
        buf[i] = hover;
        return buf;
      });
    }

    containerh.addEventListener("mouseenter", handlehover(0, true));
    containerh.addEventListener("mouseleave", handlehover(0, false));
    containerm.addEventListener("mouseenter", handlehover(1, true));
    containerm.addEventListener("mouseleave", handlehover(1, false));
    containerh.addEventListener("wheel", (e) => handleScroll(e, 0), { passive: false });
    containerm.addEventListener("wheel", (e) => handleScroll(e, 1), { passive: false });
    return () => {
      containerh.removeEventListener("wheel", (e) => handleScroll(e, 0));
      containerm.removeEventListener("wheel", (e) => handleScroll(e, 1));
    }
  }, []);

  useEffect(()=>{
    hourref.current=hour;
  },[hour])

  return (
    <div className="w-40">
      <div className="mx-auto relative flex gap-5 w-fit">
        {[0, 0].map((_, i) => (
          <p key={i} ref={(el) => { pRef.current[i] = el }} tabIndex={0} className="tabular-num text-center !duration-0 border border-gray-300 w-6.25 h-6.25 focus:border-sky-700 outline-none" style={{lineHeight:"25px"}} onKeyDown={(e) => {
            const allowedKeys = [
              'Backspace',
              '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
            ];
            const arrow = ['ArrowRight', 'ArrowLeft'];
            console.log(typeof e.key, typeof (arrow[i]));
            if (!allowedKeys.includes(e.key)) {
              e.preventDefault();
            } else if (e.key === "Backspace") {
              if (count.current[i] === 0) {
                setsethour(i, 0);
              } else {
                setsethour(i, parseInt(hour[i].toString().slice(0, -1)) || 0);
                count.current[i] -= 1;
              }
            } else {
              if (count.current[i] === 0) {
                setsethour(i, parseInt(e.key));
                count.current[i] += 1;
              } else {
                if (setsethour(i, hour[i] * 10 + parseInt(e.key))) {
                  e.currentTarget.blur();
                  if (i === 0) {
                    pRef.current[1]?.focus();
                  }
                }
              }
            }
            if (e.key === arrow[i]) {
              console.log(pRef.current[1 - i]);
              pRef.current[1 - i]?.focus();
              pRef.current[i]?.blur();
            } else if (e.key === "Enter") {
              e.currentTarget.blur();
              if (i === 0) {
                pRef.current[1]?.focus();
              }
            }
          }} onFocus={() => { setFocused([i === 0, i === 1]); count.current[i] = 0; }} onBlur={() => setFocused((prev) => { const buf = [...prev]; buf[i] = false; return buf; })}>{focused[i] ? <mark className="m-auto p-px tabular-num bg-[oklch(0.54_0.17_262.17)] text-white">{(hour[i]).toString().padStart(2, '0')}</mark> : hour[i].toString().padStart(2, '0')}</p>
        ))}
        <p className="absolute right-1/2 translate-x-1/2 text-center w-4">:</p>
      </div>
      <div className="relative bg-gray-100 border border-gray-300 rounded mt-1 shadow-lg h-24 w-[161px]">
        {["32", "79"].map((i, inde) => (
          <div key={inde} className={`absolute h-24 w-12 -top-[1px] outline-1 -outline-offset-1 outline-sky-700 z-5 ${ikkatsuhover[inde] ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${i}px` }}></div>
        ))}
        <div ref={scroh} className="absolute z-10 h-24 w-20 top-0 left-0"></div>
        <div ref={scrom} className="absolute z-20 h-24 w-20 top-0 left-20"></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] w-[161px] rounded h-5 ${type? "bg-gray-200":"bg-gray-300"}`}></div>
        {[24, 60].map((i, inde) => (
          new Array(i).fill(0).map((_, index) => (<p key={index} className={`w-8 text-center z-1 whitespace-pre tabular-nums absolute top-1/2  -translate-x-1/2 ${position[Math.max(0, Math.min(6, (index - hour[inde] + i * 3 / 2) % i - i / 2 + 3))]}`} style={
            {
              left: `${56 + inde * 47}px`,
              scale: `100% ${scale[Math.min(3, Math.abs((index - hour[inde] + i) % i), Math.abs((hour[inde] - index + i) % i))]}%`,
              opacity: `${opa[Math.min(3, Math.abs((index - hour[inde] + i) % i), Math.abs((hour[inde] - index + i) % i))]}%`,
              transition: `all ${dur}ms ease-in-out`,
            }
          }>{(index).toString().padStart(2, ['\u2007', '0'][inde])}</p>))
        ))}
      </div>
    </div>);
}