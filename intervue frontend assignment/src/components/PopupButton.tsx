import { useState } from "react";
import ParticipantsPopup from "./PariticipantPopup";

const PopupButton = () => {
  const [participantsOpen, setParticipantsOpen] = useState(false);

  return (
    <div>
    <button
        onClick={() => setParticipantsOpen(true)}
        className="fixed right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{ background: "linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-95" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="white"/>
        </svg>
    </button>

      <ParticipantsPopup isOpen={participantsOpen}  onClose={() => setParticipantsOpen(false)} />
    </div>
  );
}


export default PopupButton;