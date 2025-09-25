interface Option {
  id: string;
  text: string;
  percent: number;
}
interface QuestionResultProps {
  questionText: string;
  options: Option[];
  index?: number;
  showQuestion? : boolean
}

export default function QuestionResult({
  questionText,
  options,
  index,
  showQuestion = true
}: QuestionResultProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <h2 className="text-lg font-semibold mb-4">
        {index !== undefined ? `Question ${index + 1}` : "Question"}
      </h2>

      <div className="rounded-lg border" style={{ borderColor: "rgba(79,13,206,0.25)" }}>
        {
          showQuestion ? 
          <div className="px-6 py-3 rounded-t-lg bg-gray-gradient text-white">
           <div className="font-medium">{questionText}</div>
          </div> : null
        }

        <div className="p-6">
          <div className="space-y-4">
            {options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-4">
                <div
                  className="flex-none w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)",
                  }}
                >
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <div className="relative">
                    <div
                      className="w-full h-12 bg-[#EFEFEF] rounded-md border"
                      style={{ borderColor: "rgba(79,13,206,0.12)" }}
                    >
                      <div
                        className="h-12 rounded-md"
                        style={{
                          width: `${opt.percent}%`,
                          background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)",
                          transition: "width 300ms ease",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-6 pointer-events-none">
                        <span
                          className="text-white font-medium"
                          style={{
                            mixBlendMode: opt.percent > 30 ? "color" : "darken",
                            color: opt.percent > 30 ? "white" : "#111827",
                          }}
                        >
                          {opt.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-none ml-4">
                  <div
                    className="px-4 py-2 bg-white rounded-md border"
                    style={{
                      minWidth: 56,
                      textAlign: "center",
                      borderColor: "rgba(79,13,206,0.12)",
                    }}
                  >
                    <span className="font-semibold">{opt.percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
