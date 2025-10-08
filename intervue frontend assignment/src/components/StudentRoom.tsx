import { useEffect, useMemo, useState } from "react";
import { useRoomState, useRoomActions } from "../hooks/useRoomAction"; 
import type { Option as OptType } from "../types"; 
import StarSVG from "../assets/Star";
import StudentResult from "./StudentResult";
import StudentKicked from "./StudentKicked";
import PopupButton from "./PopupButton";
import TimerSVG from "../assets/Timer";

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

export default function StudentRoom() {
  const room = useRoomState();
  const actions = useRoomActions();
  const { activeQuestion, code , questionPercentages } = room;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const questionHeader = useMemo(() => {
    if (!activeQuestion) return "";
    return `Question`;
  }, [activeQuestion]);

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

  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setError(null);
  }, [activeQuestion?.id]);

  function handleSubmitAnswer() {
    if (!activeQuestion) {
      setError("No active question");
      return;
    }
    if (!selectedOption) {
      setError("Please select an option");
      return;
    }
    setError(null);
    setIsSubmitted(true);

    actions.submitAnswer(selectedOption, code ?? undefined);
  }

  if (!activeQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div 
              className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)' }}
          >
            <StarSVG />
            Intervue Poll
        </div>

        <div className="mb-8 mt-6">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="animate-spin">
            <path d="M12 2a10 10 0 1 0 10 10" stroke="#6C3AEF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h3 className="text-2xl font-semibold mb-2">Wait for the teacher to ask questions..</h3>

        <PopupButton />
      </div>
    );
  }

  const opts: OptType[] = activeQuestion.options ?? [];
  

  if (room.kickedOut) {
    return <StudentKicked />
  }

  if(isSubmitted){
    return (
      <StudentResult
        questionText={activeQuestion?.text ?? ""}
        options={opts}
        percentages={questionPercentages ?? {}}
        selectedOptionId={selectedOption}
        index={typeof (activeQuestion as any)?.index === "number" ? (activeQuestion as any).index : undefined}
        showContinue={false}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-start relative justify-center bg-white py-12 px-4">
      <div className="w-full max-w-2xl mx-auto absolute top-1/4 right-1/4">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-semibold">{questionHeader}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TimerSVG />
            <span className="font-medium text-red-600">{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        <div className="rounded-lg border" style={{ borderColor: "rgba(79,13,206,0.25)" }}>
          <div className="px-6 py-3 rounded-t-lg bg-gray-gradient text-white">
            <div className="font-medium">{activeQuestion.text}</div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {opts.map((opt, idx) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (remainingSeconds <= 0 || isSubmitted) return;
                      setSelectedOption(opt.id);
                    }}
                    className={`flex items-center gap-4 cursor-pointer rounded-md border-2 p-4 ${
                      isSelected ? "border-purple-600 bg-white" : "bg-[#F5F5F6] border-[#EFEFEF]"
                    }`}
                  >
                    <div
                      className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ background: `${ isSelected ? 'linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)' : '#8D8D8D'}` }}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <div className={`${isSelected ? 'text-gray-800 font-semibold' : 'bg-[#F5F5F6] border-[#EFEFEF]'} `}>{opt.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          {error && <div className="text-red-600 mr-4">{error}</div>}
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption || isSubmitted || remainingSeconds <= 0}
            className="px-8 py-3 rounded-full text-white font-medium"
            style={{
              background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)",
              opacity: !selectedOption || isSubmitted ? 0.6 : 1,
            }}
          >
            {isSubmitted ? "Submitted" : "Submit"}
          </button>
        </div>
      </div>

      <PopupButton />
    </div>
  );
}
