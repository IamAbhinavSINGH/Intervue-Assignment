import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import StudentJoin from './components/StudentJoin';
import TeacherRoom from './components/TeacherRoom';
import PollHistoryPage from './components/PollHistoryPage';
import StudentRoom from './components/StudentRoom';

/**
 * Placeholder routes:
 * - /                 => Landing
 * - /teacher/create   => teacher create room form
 * - /student/join     => student join form
 * - /teacher/room/:code and /student/room/:code you can add later
 */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student/join" element={<StudentJoin />} />
      <Route path='/student/room/:code' element={<StudentRoom />}/>
      <Route path='/teacher/room/:code' element={<TeacherRoom />} />
      <Route path='/teacher/room/:code/history' element={<PollHistoryPage />}/>
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
