import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      toast.success('Signed up successfully!');
      authLogin(res.data); // Log the user in
      navigate('/upload'); // Redirect to the upload page
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-3 py-2 mt-1 text-gray-900 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;