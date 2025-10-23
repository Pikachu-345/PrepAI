import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';
import { FileText, FileUp, Trash2, ChevronRight } from 'lucide-react'; 

const Upload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docState, setDocState] = useState({ resume: false, jd: false });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}api/documents/list`);
      setDocuments(res.data);

      const hasResume = res.data.some(doc => doc.type === 'resume');
      const hasJD = res.data.some(doc => doc.type === 'jd');
      setDocState({ resume: hasResume, jd: hasJD });

    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}api/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-blue-400">
          Upload Your Documents
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-700 hover:border-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <FileUp className="w-12 h-12 text-blue-500 mb-4 transition-colors duration-300" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Upload Resume</h2>
            <p className="text-sm text-gray-400 mb-5 text-center">Drag & drop or click to upload your resume (PDF, max 2MB).</p>
            <DocumentUpload fileType="resume" onUploadSuccess={fetchDocuments} />
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-700 hover:border-green-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <FileUp className="w-12 h-12 text-green-500 mb-4 transition-colors duration-300" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Upload Job Description</h2>
            <p className="text-sm text-gray-400 mb-5 text-center">Drag & drop or click to upload the job description (PDF, max 2MB).</p>
            <DocumentUpload fileType="jd" onUploadSuccess={fetchDocuments} />
          </div>
        </div>

        {docState.resume && docState.jd && (
          <div className="my-10 p-6 text-center bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg border border-blue-500 transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
            <p className="mb-4 text-lg font-semibold">You're ready to start!</p>
            <Link
              to="/chats"
              className="inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-indigo-800 rounded-lg hover:bg-indigo-900 transition-all duration-300 shadow-md group transform hover:scale-105"
            >
              Start New Interview
              <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 duration-300" />
            </Link>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-gray-300">Your Uploaded Documents</h2>
          {loading ? (
            <p className="text-center text-gray-400">Loading documents...</p>
          ) : (
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              {documents.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                  {documents.map(doc => (
                    <li
                      key={doc._id}
                      className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-700/50 transition-all duration-200 ease-in-out group"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <FileText
                          className={`w-6 h-6 shrink-0 ${doc.type === 'resume' ? 'text-blue-400' : 'text-green-400'} transition-colors duration-200`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-white truncate">{doc.filename}</p>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${doc.type === 'resume' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'} transition-colors duration-200`}>
                            {doc.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                        aria-label={`Delete ${doc.filename}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-6 text-center text-gray-400">No documents uploaded yet. Upload a resume and a job description to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;