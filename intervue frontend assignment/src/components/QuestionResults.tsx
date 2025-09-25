interface Option {
  id: string
  text: string
  percent: number
}
interface QuestionResultProps {
  questionText: string
  options: Option[]
  index?: number
  showQuestion?: boolean
}

export default function QuestionResult({ questionText, options, index, showQuestion = true }: QuestionResultProps) {

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      {showQuestion ? (
        <div className="flex items-center justify-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-black">
            {index !== undefined ? `Question ${index + 1}` : "Question"}
          </h2>
        </div>
      ) : null}

      <div className="bg-white border w-full border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-gradient px-6 py-4 w-full">
          <div className="text-white font-medium text-base">{questionText}</div>
        </div>

        <div className="p-6 space-y-3 w-full">
          {options.map((opt, idx) => (
            <div key={opt.id} className="relative">
              <div className="w-full h-12 bg-[#F6F6F6] rounded-md border border-[#8D8D8D30] relative overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${opt.percent}%`,
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

                    <span className={`font-medium text-sm ${opt.percent > 20 ? 'text-white' : 'text-black'}`}>{opt.text}</span>
                  </div>

                  <span className="font-semibold text-sm text-black bg-transparent px-2 py-1 rounded">{opt.percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
