import './App.css';
import NavComp from './components/NavComp';
import LandingPage from './components/LandingPage';
import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import AppRoutes from './components/AppRoutes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <div className="App">
      <AppRoutes isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
}
export default App;