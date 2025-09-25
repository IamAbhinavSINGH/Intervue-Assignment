

export default function StudentKicked() {



  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-3xl text-center">
        <div
          className="inline-block px-4 py-1 rounded-full text-sm text-white mb-6"
          style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}
        >
          Intervue Poll
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold mb-4">You’ve been Kicked out !</h1>

        <p className="text-gray-500 mb-8">
          Looks like the teacher had removed you from the poll system. Please try again sometime.
        </p>
      </div>
    </div>
  );
}
