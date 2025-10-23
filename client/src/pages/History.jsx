import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PlusCircle, MessageSquareText, Loader2 } from 'lucide-react'; 

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}api/chat/history`);
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
        toast.error('Failed to fetch chat history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleNewChat = () => {
    navigate('/chat/new'); 
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p>Loading history...</p>
    </div>;
  }

  return (
    // Main container with padding, relative positioning for FAB
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-400">Chat History</h1>

        {/* Chat List */}
        <div className="space-y-4 pb-20"> {/* Add padding-bottom to avoid overlap with FAB */}
          {chats.length > 0 ? (
            chats.map(chat => (
              <Link
                key={chat._id}
                to={`/chat/${chat._id}`}
                className="block p-4 sm:p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700/80 transition-all duration-200 border border-gray-700 hover:border-blue-600 group"
              >
                <div className="flex items-center space-x-3 mb-2">
                   <MessageSquareText className="w-5 h-5 text-blue-400 shrink-0" />
                   {/* Ellipsis for long filenames */}
                   <h2 className="text-lg sm:text-xl font-semibold text-blue-300 truncate group-hover:text-blue-200 transition-colors duration-200" title={chat.jdFilename}>
                    {chat.jdFilename || "Job Description"}
                   </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 truncate pl-8" title={chat.resumeFilename}>
                  with {chat.resumeFilename || "Resume"}
                </p>
                <p className="mt-3 text-xs text-gray-500 text-right">
                  {new Date(chat.createdAt).toLocaleString()}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-400 pt-10">You have no chat history yet. Start a new interview!</p>
          )}
        </div>

        {/* Floating Action Button (FAB) for New Chat */}
        <button
          onClick={handleNewChat}
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110"
          aria-label="Start New Chat"
        >
          <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
};

export default History;