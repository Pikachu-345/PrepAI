import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';

const Upload = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docState, setDocState] = useState({ resume: false, jd: false });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/documents/list');
      setDocuments(res.data);
      
      // Check if at least one resume and one JD exists
      const hasResume = res.data.some(doc => doc.type === 'resume');
      const hasJD = res.data.some(doc => doc.type === 'jd');
      setDocState({ resume: hasResume, jd: hasJD });

    } catch (err) {
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
      await axios.delete(`http://localhost:5000/api/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments(); // Refresh the list
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="max-w-4xl min-h-screen p-8 mx-auto text-white">
      <h1 className="mb-6 text-3xl font-bold">Document Upload</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-2xl">Upload Resume</h2>
          <DocumentUpload fileType="resume" onUploadSuccess={fetchDocuments} />
        </div>
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-2xl">Upload Job Description</h2>
          <DocumentUpload fileType="jd" onUploadSuccess={fetchDocuments} />
        </div>
      </div>

      {docState.resume && docState.jd && (
        <div className="p-4 my-8 text-center bg-green-800 rounded-lg">
          <p className="mb-3 text-lg">You're all set! You have a resume and a job description.</p>
          <Link to="/chat" className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Start Chat
          </Link>
        </div>
      )}

      <div className="mt-12">
        <h2 className="mb-4 text-2xl">Your Documents</h2>
        {loading ? (
          <p>Loading documents...</p>
        ) : (
          <ul className="space-y-3">
            {documents.length > 0 ? documents.map(doc => (
              <li key={doc._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <span className="px-2 py-1 mr-3 text-xs font-bold text-white uppercase bg-blue-600 rounded">
                    {doc.type}
                  </span>
                  <span>{doc.filename}</span>
                </div>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </li>
            )) : (
              <p className="text-gray-400">No documents uploaded yet.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Upload;