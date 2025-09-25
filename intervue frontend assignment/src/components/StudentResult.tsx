import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import QuestionResult from "./QuestionResults";
import PopupButton from "./PopupButton";
import TimerSVG from "../assets/Timer";

interface Opt {
  id: string;
  text: string;
}

interface Props {
  questionText: string;
  options: Opt[]; 
  percentages: Record<string, number>; 
  selectedOptionId?: string | null;
  index?: number;
  showContinue?: boolean;
  onContinue?: () => void;
}

export default function StudentResult({
  questionText,
  options,
  percentages,
  index,
}: Props) {
  const resultOptions = options.map((o) => ({
    id: o.id,
    text: o.text,
    percent: percentages?.[o.id] ?? 0,
  }));
  const activeQuestion = useAppSelector((s) => s.room.activeQuestion);
  const [remainingSeconds , setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
      if (!activeQuestion || !activeQuestion.startedAt || !activeQuestion.timeLimit) {
        setRemainingSeconds(0);
        return;
      }
  
      const startedMs =
        typeof activeQuestion.startedAt === "number"
          ? activeQuestion.startedAt
          : Date.parse(String(activeQuestion.startedAt));
      const endTs = startedMs +( (activeQuestion.timeLimit ?? 60) * 1000);
  
      function tick() {
        const secs = Math.ceil((endTs - Date.now()) / 1000);
        setRemainingSeconds(Math.max(0, secs));
      }
  
      console.log("timeLimit : " , activeQuestion.timeLimit);
      console.log("rem time : " , (endTs - Date.now()) / 100);
  
      tick();
      const t = setInterval(tick, 300);
      return () => clearInterval(t);
    }, [activeQuestion]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-white py-12 px-4 relative">
      <div className="w-full absolute top-1/4 right-1/4 max-w-2xl mx-auto ">

         <div className="flex items-center gap-4 mb-4">
          <h3 className="text-2xl font-semibold">{'Question'}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TimerSVG />
            <span className="font-medium text-red-600">{formatTime(remainingSeconds)}</span>
          </div>
        </div>
        
        <QuestionResult showQuestion={false} questionText={questionText} options={resultOptions} index={index} />

        <div className="text-center mt-6">
          <div className="text-lg font-medium">Wait for the teacher to ask a new question..</div>
        </div>
      </div>

      <PopupButton />
    </div>
  );
}


function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}