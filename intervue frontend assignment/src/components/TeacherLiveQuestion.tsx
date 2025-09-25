import { useAppSelector } from "../store/hooks";
import { useDispatch } from "react-redux";
import { roomActions } from "../store/roomSlice";
import socketManager from "../sockets/socketManager";
import { useNavigate } from "react-router-dom";
import PopupButton from "./PopupButton";

export default function TeacherLiveQuestion() {
  const activeQuestion = useAppSelector((s) => s.room.activeQuestion);
  const percentages = useAppSelector((s) => s.room.questionPercentages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const code = useAppSelector((s) => s.room.code);

  if (!activeQuestion) return null;

  const opts = activeQuestion.options ?? [];

  const getPercent = (optionId: string) => {
    const p = percentages?.[optionId];
    if (typeof p === "number") return Math.max(0, Math.min(100, p));
    return 0;
  };

  const askNewQuestion = () => {
    dispatch(roomActions.clearActiveQuestion());
    socketManager.endQuestion();
  }

  return (
    <div className="min-h-screen p-10 relative">
      <div className="max-w-6xl mx-auto ">
        <div className="absolute right-5 top-5">
          <button
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium"
            style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}
            onClick={() => {
              if(code) navigate(`/teacher/room/${code}/history`)
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" fill="white"/>
              <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="white" />
            </svg>
            <span>View Poll history</span>
          </button>
        </div>

        <div className="w-full max-w-2xl absolute top-1/4 left-1/4 mx-auto">
            <h2 className="text-lg font-semibold mb-4">Question</h2>

            <div className="rounded-lg border" style={{ borderColor: "rgba(79,13,206,0.25)" }}>
            <div className="px-6 py-3 rounded-t-lg bg-gray-gradient text-white">
                <div className="font-medium">{activeQuestion.text}</div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                {opts.map((opt, idx) => {
                    const p = getPercent(opt.id);
                    return (
                    <div key={opt.id} className="flex items-center gap-4">
                        <div
                        className="flex-none w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}
                        >
                        {idx + 1}
                        </div>

                        <div className="flex-1">
                        <div className="relative">
                            <div className="w-full h-12 bg-[#EFEFEF] rounded-md border" style={{ borderColor: "rgba(79,13,206,0.12)" }}>
                            <div
                                className="h-12 rounded-md"
                                style={{
                                    width: `${p}%`,
                                    background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)",
                                    transition: "width 300ms ease",
                                }}
                            />
                            <div className="absolute inset-0 flex items-center px-6 pointer-events-none">
                                <span className="text-white font-medium" style={{ mixBlendMode: p > 30 ? 'color' : 'darken', color: p > 30 ? 'white' : '#111827' }}>
                                {opt.text}
                                </span>
                            </div>
                            </div>
                        </div>
                        </div>

                        <div className="flex-none ml-4">
                        <div className="px-4 py-2 bg-white rounded-md border" style={{ minWidth: 56, textAlign: "center", borderColor: "rgba(79,13,206,0.12)" }}>
                            <span className="font-semibold">{p}%</span>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
            </div>

            <div className="mt-8 flex justify-end">
            <button
                onClick={askNewQuestion}
                className=" cursor-pointer px-8 py-3 rounded-full text-white font-medium"
                style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}
            >
                + Ask a new question
            </button>
            </div>
        </div>

        <PopupButton />
      </div>
    </div>
  );

}