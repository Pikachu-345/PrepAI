import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || '';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewChat = id === 'new';

  const [chatId, setChatId] = useState(isNewChat ? null : id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [documents, setDocuments] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJd, setSelectedJd] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isNewChat) {
          const res = await axios.get(`${API_URL}api/documents/list`);
          setDocuments(res.data);
        } else {
          if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            toast.error('Invalid chat ID.');
            navigate('/history');
            return;
          }
          const res = await axios.get(`${API_URL}api/chat/${id}`);
          setChatId(id);
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load chat or documents.');
        if (!isNewChat) navigate('/chats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isNewChat, navigate]);

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
      const res = await axios.post(`${API_URL}api/chat/start`, {
        resumeId: selectedResume,
        jdId: selectedJd,
      });

      if (res.data?.chatId) {
        navigate(`/chat/${res.data.chatId}`);
      } else {
        toast.error('Failed to start chat: Missing chat ID.');
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      toast.error(err.response?.data?.message || 'Failed to start chat.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setSending(true);

    try {
      const res = await axios.post(`${API_URL}api/chat/query`, {
        chatId,
        message: currentInput,
      });
      const aiMessage = { role: 'model', content: res.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to get AI response.');
      setMessages(prev => prev.slice(0, -1));
      setInput(currentInput);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, sending]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-gray-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3">Preparing your AI for interview...</p>
      </div>
    );
  }

  if (isNewChat) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-white bg-gray-900">
        <form
          onSubmit={handleStartChat}
          className="p-6 sm:p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
        >
          <h1 className="mb-6 text-xl sm:text-2xl font-bold text-center text-blue-400">
            Start New Interview
          </h1>

          <div className="mb-4">
            <label htmlFor="resumeSelect" className="block mb-2 text-sm font-medium text-gray-300">
              Select Resume
            </label>
            <select
              id="resumeSelect"
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            >
              <option value="">-- Choose a resume --</option>
              {resumes.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.filename}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="jdSelect" className="block mb-2 text-sm font-medium text-gray-300">
              Select Job Description
            </label>
            <select
              id="jdSelect"
              value={selectedJd}
              onChange={(e) => setSelectedJd(e.target.value)}
              className="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing your AI for interview...</> : 'Start Interview'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 text-white sm:max-w-3xl sm:mx-auto">
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto mb-16">
        <div className="flex flex-col gap-3 sm:gap-4">
          {messages.map((msg, index) => (
            <div
              key={msg._id || `msg-${index}-${msg.role}`}
              className={`p-3 sm:p-4 rounded-lg max-w-[85%] sm:max-w-[80%] wrap-break-word ${
                msg.role === 'user'
                ? 'bg-blue-600 self-end rounded-br-none'
                : 'bg-gray-700 self-start rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
              ) : (
                <ReactMarkdown >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          ))}
          {sending && (
            <div className="p-3 sm:p-4 bg-gray-700 rounded-lg self-start max-w-[80%]">
              <p className="flex items-center text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmitMessage}
        className="fixed bottom-0 left-0 right-0 flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-t border-gray-700 bg-gray-900 sm:max-w-3xl sm:mx-auto"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your answer..."
          className="flex-1 px-4 py-2 text-sm sm:text-base text-white bg-gray-800 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          className="p-2 sm:p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-blue-400 transition duration-200"
          disabled={sending || !input.trim()}
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default Chat;