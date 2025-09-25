import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarSVG from '../assets/Star';
import { useAppDispatch } from '../store/hooks';
import { createRoom } from '../store/roomSlice';

export default function Landing() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleCreate() {
    setLoading(true);
    try {
      const result = await dispatch(createRoom({ teacherName: 'New Teacher'})).unwrap();
      console.log("result : " , result);

      if(result && result.code){
        const finalCode = result.code.trim();
        navigate(`/teacher/room/${finalCode}`);
      }

    } catch (err: any) {
      alert('Failed to create room: ' + (err?.message ?? 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  const handleOnClick = () => {
    if(role === 'student'){
      navigate('/student/join');
    }
    else{
      handleCreate();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-10">
      <div className="w-full max-w-5xl text-center flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <div 
              className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg,#7765DA 0%,#4F0DCE 100%)' }}
          >
            <StarSVG />
            Intervue Poll
          </div>
        </div>

        <h1 className="text-4xl leading-tight font-light text-dark-gray mb-3">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        <p className="text-muted text-base mb-10 w-[60%]">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex justify-center gap-8 mb-10">
          <RoleCard
            title="I'm a Student"
            desc="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
            selected={role === 'student'}
            onClick={() => setRole('student')}
          />
          <RoleCard
            title="I'm a Teacher"
            desc="Submit answers and view live poll results in real-time."
            selected={role === 'teacher'}
            onClick={() => setRole('teacher')}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleOnClick}
            className="px-10 py-3 rounded-full text-white btn-primary font-semibold bg-custom-radius"
            style={{ minWidth: 190 }}
          >
            { loading ? 'Loading...' : 'Continue' }
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ title, desc, selected, onClick }: { title: string; desc: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full max-w-96 text-left p-6 rounded-md border-2 bg-white ${selected ? 'shadow-card' : ''}`}
      style={{
        border: selected ? '2px solid #5767D0' : '1px solid #ECECEC',
        cursor: 'pointer',
      }}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-gray">{desc}</p>
    </button>
  );
}
