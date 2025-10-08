import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createQuestion } from "../store/roomSlice";
import socketManager from "../sockets/socketManager";
import StarSVG from "../assets/Star";
import TriangleSVG from "../assets/Traingle";
import TeacherLiveQuestion from "./TeacherLiveQuestion";

export default function TeacherRoom(){
  const activeQuestion = useAppSelector(s => s.room.activeQuestion);
  return activeQuestion ? <TeacherLiveQuestion /> : <TeacherQuestionForm />
}

export function TeacherQuestionForm() {
  const { code } = useParams<{ code: string }>();
  const dispatch = useAppDispatch();
  const [questionText, setQuestionText] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: "opt-1", text: "" },
    { id: "opt-2", text: "" },
  ]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(questionText.length);
  }, [questionText]);

  function updateOptionText(index: number, text: string) {
    setOptions((prev) =>
        prev.map((option, i) =>
            i === index ? { ...option, text } : option
        )
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, { id: `opt-${prev.length + 1}`, text: "" }]);
  }

  function removeOption(index: number) {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (correctIndex !== null) {
        if (index === correctIndex) {
          setCorrectIndex(null);
        } else if (index < correctIndex) {
          setCorrectIndex(correctIndex - 1);
        }
      }
      return next;
    });
  }

  async function handleAskQuestion() {
    if (!code) return;
    if (!questionText.trim()) {
      console.warn("Question text required");
      return;
    }
    if (options.length < 2) {
      console.warn("At least two options required");
      return;
    }

    const cleanedOptions = options.map((o) => ({ text: (o.text || "").trim() }));
    if (cleanedOptions.some((o) => !o.text)) {
      console.warn("All options should have text");
      return;
    }

    const payloadOptions: { text: string; isCorrect?: boolean }[] = cleanedOptions.map((o, idx) => ({
      text: o.text,
      isCorrect: correctIndex === idx,
    }));

    setLoading(true);
    try {
      const result: any = await dispatch(createQuestion({ code, question: questionText.trim(), options: payloadOptions, timeLimit })).unwrap();
      console.log("question result : " , result);
      const createdQuestionId = result?.created?.question?.id ?? null;
      let qid = createdQuestionId;

      if (!qid && result?.created) {
        qid = (result.created as any).id ?? (result.created as any)?.question?.id ?? null;
      }

      if (!qid) {
        console.log("createQuestion result:", result);
      }

      if (qid) {
        socketManager.startQuestion(qid, code);
        console.log("Started question", qid);
      } else {
        console.log("Question created but id not detected; server response:", result);
      }
    } catch (err) {
      console.error("createQuestion error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 relative">
      <div className="max-w-5xl lg:ml-20 bg-white p-8 rounded-md">
        <div className="mb-6">
           <div 
              className="px-4 py-2 w-fit rounded-full text-white text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)' }}
          >
            <StarSVG />
            Intervue Poll
          </div>
          <h1 className="text-4xl font-light mt-4">Let's <span className="font-bold">Get Started</span></h1>
          <p className="text-black opacity-50 mt-2  md:w-[65%]">
            you'll have the ability to create and manage polls, ask questions, and monitor your student's responses in real-time.
        </p>
        </div>

        <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-lg">Enter your question</div>
            <SelectTimeDropDown timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
        </div>

        <div className="mb-6 relative">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question..."
            maxLength={100}
            rows={5}
            className="w-full p-6 bg-[#EFEFEF] rounded-sm resize-none"
          />
          <div className="absolute bottom-4 right-4 text-right text-sm text-muted mt-2">{charCount}/100</div>
        </div>

        <div className="w-full max-w-3/4 flex flex-row justify-between gap-10">
            <div className="font-medium mb-3">Edit Options</div>
            <div className="font-medium mb-3">Is it Correct?</div>
        </div>

         <div className="flex flex-col space-y-3 w-full max-w-3/4">
              {options.map((opt, idx) => (
                <OptionRow
                    key={opt.id}
                    idx={idx}
                    option={opt}
                    options={options}
                    correctIndex={correctIndex}
                    updateOptionText={updateOptionText}
                    removeOption={removeOption}
                    setOptionCorrect={(i : number) => setCorrectIndex(i)}
                    optionsLength={options.length}
                />
              ))}
        </div>

        <div className="mt-4">
            <button onClick={addOption} className="px-4 py-2 rounded-md border border-[#F1F1F1] text-brand-deep text-sm">
                + Add More option
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-2 flex justify-end">
        <button
          onClick={handleAskQuestion}
          className="px-8 py-3 rounded-full btn-primary text-white font-medium"
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask Question"}
        </button>
      </div>

      <div className="absolute top-10 right-10 w-fit px-6 py-2 bg-[#EFEFEF] rounded-md">
            {`code - ${code}`}
      </div>
    </div>
  );
}

function OptionRow({ idx, option, correctIndex, updateOptionText, removeOption , setOptionCorrect , options} : any){
    return (
      <div className="w-full flex items-center gap-2 py-3">
        <div className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}>
          {idx + 1}
        </div>

        <input
          value={option.text}
          onChange={(e) => updateOptionText(idx, e.target.value)}
          placeholder={`Option ${idx + 1}`}
          className="flex-1 p-3 bg-[#EFEFEF] rounded-sm border border-transparent"
        />

        <div className="flex flex-row gap-2 items-start ml-6">
          <label 
            className="inline-flex items-center gap-2 cursor-pointer">
            <input
              onChange={() => setOptionCorrect(idx , true)}
              type="radio"
              name={`correct-${idx}`}
              checked={correctIndex === idx}
              className="form-radio"
            />
            <span className="ml-1 text-sm">Yes</span>
          </label>
          <label 
            className="inline-flex items-center gap-2 cursor-pointer">
            <input
              onChange={() => setOptionCorrect(idx , true)}
              type="radio"
              name={`notcorrect-${idx}`}
              checked={correctIndex !== idx}
              className="form-radio"
            />
            <span className="ml-1 text-sm">No</span>
          </label>
        </div>

        {options.length > 2 && (
          <button onClick={() => removeOption(idx)} className="ml-4 text-sm text-muted-gray">
            Remove
          </button>
        )}
      </div>
    );
}


const SelectTimeDropDown = ({ timeLimit, setTimeLimit }: { timeLimit: number, setTimeLimit: (value: number) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref !== null && ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div 
            ref={ref}
            className="w-fit px-4 py-2 flex gap-2 items-center bg-[#F1F1F1] text-black rounded-md"
            onClick={() => setIsOpen(true)}
        >
            <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="appearance-none w-full rounded-lg focus:outline-none cursor-pointer "
            >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={120}>120 seconds</option>
            </select>     

            <TriangleSVG className={ `${isOpen ? 'rotate-180' : 'rotate-0'}`} />       
        </div>
    );
}