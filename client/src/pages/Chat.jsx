import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Chat = () => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const [documents, setDocuments] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJd, setSelectedJd] = useState('');
  
  const [loading, setLoading] = useState(false); 
  const [chatStarted, setChatStarted] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/documents/list`);
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Could not fetch your documents.');
      }
      setLoading(false);
    };
    fetchDocs();
  }, []); 

  const resumes = useMemo(() => documents.filter(d => d.type === 'resume'), [documents]);
  const jds = useMemo(() => documents.filter(d => d.type === 'jd'), [documents]);

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!selectedResume || !selectedJd) {
      toast.error('Please select one resume and one JD.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}api/chat/start`, {
        resumeId: selectedResume,
        jdId: selectedJd,
      });
      
      setChatId(res.data.chatId);
      setMessages([{ role: 'model', content: res.data.firstMessage }]);
      setChatStarted(true); 
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat.');
    }
    setLoading(false);
  };
  
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/query`, {
        chatId,
        message: input,
      });
      const aiMessage = { role: 'model', content: res.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get response from AI.');
    }
    setLoading(false);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);


  if (!chatStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <form onSubmit={handleStartChat} className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
          <h1 className="mb-6 text-2xl font-bold text-center">Start New Interview</h1>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">Select Resume</label>
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded-lg"
              disabled={loading}
            >
              <option value="">-- Choose a resume --</option>
              {resumes.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.filename}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-300">Select Job Description</label>
            <select
              value={selectedJd}
              onChange={(e) => setSelectedJd(e.target.value)}
              className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded-lg"
              disabled={loading}
            >
              <option value="">-- Choose a JD --</option>
              {jds.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.filename}</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Interview'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl p-4 mx-auto text-white">
      <h1 className="pb-4 text-3xl font-bold text-center border-b border-gray-700">
        AI Interview
      </h1>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'}`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="p-4 bg-gray-700 rounded-lg self-start"><p>Typing...</p></div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmitMessage} className="flex gap-4 p-4 border-t border-gray-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-lg"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;