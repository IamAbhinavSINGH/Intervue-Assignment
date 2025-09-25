import { useDispatch } from "react-redux";
import { roomActions } from "../store/roomSlice";
import { useRoomState, useRoomActions } from "../hooks/useRoomAction"; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParticipantsPopup({ isOpen, onClose }: Props) {
  const dispatch = useDispatch();
  const room = useRoomState();
  const actions = useRoomActions();

  if (!isOpen) return null;

  const students = room.students ?? [];
  const isTeacher = !!room.teacherToken; 
  const roomCode = room.code;

  const handleKick = (socketId: string) => {
    dispatch(roomActions.removeStudent({ socketId }));
    actions.removeStudent(socketId, roomCode ?? undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        style={{ pointerEvents: "auto" }}
      />

      <div
        className="relative mt-24 ml-auto mr-12 w-[360px] bg-white rounded shadow-2xl pointer-events-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3 rounded-t">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Chat</div>
            <div className="relative">
              <div className="text-sm font-semibold">Participants</div>
              <div className="absolute left-0 right-0 -bottom-2 h-1.5 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE]" style={{ width: 120, margin: "0 auto" }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b text-sm text-gray-500 flex justify-between">
          <div className="font-medium">Name</div>
          <div className="font-medium">Action</div>
        </div>

        <div style={{ maxHeight: 320 }} className="overflow-y-auto">
          {students.length === 0 ? (
            <div className="px-6 py-6 text-center text-gray-500">No participants yet</div>
          ) : (
            <ul className="divide-y">
              {students.map((s : any) => (
                <li key={s.socketId} className="px-6 py-4 flex items-center justify-between">
                  <div className="text-gray-900 font-medium">
                    {s.name ?? "Anonymous"}
                  </div>

                  <div>
                    {isTeacher ? (
                      <button
                        onClick={() => handleKick(s.socketId)}
                        className="text-sm text-blue-600 hover:underline"
                        aria-label={`Kick out ${s.name ?? "participant"}`}
                      >
                        Kick out
                      </button>
                    ) : (
                      <div style={{ width: 64 }} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
