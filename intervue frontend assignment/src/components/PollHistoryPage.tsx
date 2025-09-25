import { useEffect, useState } from "react";
import QuestionResult from "../components/QuestionResults";
import { getPollHistory } from "../api/roomApi";
import { useAppSelector } from "../store/hooks";
import PopupButton from "./PopupButton";


export default function PollHistoryPage() {
    
  const [questions, setQuestions] = useState<
    { id: string; text: string; options: { id: string; text: string; percent: number }[] }[]
  >([]);
  const code = useAppSelector((s) => s.room.code);

    useEffect(() => {
        const fetchHistory = async() => {
            if(code){
                const res = await getPollHistory(code);
                setQuestions(res);
            }
        }

        fetchHistory();
    }, [code]);

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <h1 className="text-3xl font-bold mb-10 text-center">View Poll History</h1>
      {questions.map((q, idx) => (
        <QuestionResult
          key={q.id}
          questionText={q.text}
          options={q.options}
          index={idx}
        />
      ))}

      <PopupButton />
    </div>
  );
}
