import { Link } from 'react-router-dom';
import { FileText, Sparkles, MessageSquareQuote } from 'lucide-react'; 
import useAuth  from '../hooks/useAuth';

const Home = () => {
  const { token } = useAuth();

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Nail Your Next Interview with <span className="text-blue-500">PrepAI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
          Upload your resume and a job description to start a realistic, AI-powered interview.
          Get instant feedback and practice until you're perfect.
        </p>
        
        {/* --- MODIFIED BUTTONS --- */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {token ? (
            // User is LOGGED IN
            <Link 
              to="/upload" // Link to /upload
              className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Get Started
            </Link>
            // Login button is removed as requested
          ) : (
            // User is LOGGED OUT
            // "Get Started" button is removed, only Login is kept
            <Link 
              to="/login" 
              className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
        {/* --- END OF MODIFICATION --- */}
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-900 rounded-lg shadow-xl">
              {/* --- USE LUCIDE ICON --- */}
              <FileText className="w-12 h-12 mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-3">1. Upload Your Docs</h3>
              <p className="text-gray-400">
                Provide your personal resume and the job description for the role you're targeting.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-900 rounded-lg shadow-xl">
              {/* --- USE LUCIDE ICON --- */}
              <Sparkles className="w-12 h-12 mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-3">2. Get AI Questions</h3>
              <p className="text-gray-400">
                Our AI analyzes the JD and generates realistic, role-specific questions for you to answer.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center p-6 text-center bg-gray-900 rounded-lg shadow-xl">
              {/* --- USE LUCIDE ICON --- */}
              <MessageSquareQuote className="w-12 h-12 mb-4 text-blue-400" /> 
              <h3 className="text-2xl font-bold mb-3">3. Receive Feedback</h3>
              <p className="text-gray-400">
                Get an instant score and constructive feedback on your answers, based on your resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

