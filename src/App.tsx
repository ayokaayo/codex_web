import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DeleteAccountPage } from './pages/DeleteAccountPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />
    </Routes>
  );
}

export default App;


