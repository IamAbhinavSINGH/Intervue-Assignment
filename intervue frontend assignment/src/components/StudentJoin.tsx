import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { joinRoomAsStudent } from '../store/roomSlice';
import StarSVG from '../assets/Star';

export default function StudentJoin() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleJoin() {
    if (!code.trim()) {
      alert('Enter room code');
      return;
    }
    setLoading(true);
    try {
      await dispatch(joinRoomAsStudent({ code: code.trim(), name: name || 'Student' })).unwrap();
      navigate(`/student/room/${code.trim()}`);
    } catch (err: any) {
      alert('Failed to join room: ' + (err?.message ?? 'room may not exist'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-10">
      <div className="w-full max-w-2xl bg-white p-10 rounded-xl2 shadow-card">
        <div className="mb-6">
          <div 
              className="px-4 py-2 w-fit rounded-full text-white text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)' }}
          >
            <StarSVG />
            Intervue Poll
          </div>
          <h2 className="text-3xl font-bold mt-4">Let's Get Started</h2>
          <p className="text-muted text-sm mt-2">If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-dark-gray">Enter your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full p-3 border card-border rounded-md" />

          <label className="block text-sm font-medium text-dark-gray">Enter Room Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Room code from teacher" className="w-full p-3 border card-border rounded-md" />
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button onClick={handleJoin} disabled={loading} className="px-6 py-3 rounded-full btn-primary text-white font-medium">
            {loading ? 'Joining...' : 'Continue'}
          </button>
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-md border card-border">Back</button>
        </div>
      </div>
    </div>
  );
}
