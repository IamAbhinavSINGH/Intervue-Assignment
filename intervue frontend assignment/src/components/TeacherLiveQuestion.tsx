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

  const options = activeQuestion.options ?? [];

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

            <div className="p-6 space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className="relative">
                  <div className="w-full h-12 bg-[#F6F6F6] rounded-md border border-[#8D8D8D30] relative overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${getPercent(opt.id)}%`,
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <span className="font-semibold text-sm" style={{ color: "#6366f1" }}>
                            {idx + 1}
                          </span>
                        </div>

                        <span className={`font-medium text-sm ${getPercent(opt.id) > 20 ? 'text-white' : 'text-black'}`}>{opt.text}</span>
                      </div>

                      <span className="font-semibold text-sm text-black bg-transparent px-2 py-1 rounded">{getPercent(opt.id)}%</span>
                    </div>
                  </div>
                </div>
              ))}
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