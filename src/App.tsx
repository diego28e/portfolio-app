import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Portfolio } from './pages/Portfolio';
import { ManageProjects } from './pages/ManageProjects';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/manage" element={<ManageProjects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;