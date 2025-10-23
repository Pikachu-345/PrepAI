import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider  from './context/AuthProvider';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Upload from './pages/Upload';
import Chat from './pages/Chat';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';


function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          }
        }}
      />
      
      <div className="h-full bg-gray-900 overflow-hiden">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;