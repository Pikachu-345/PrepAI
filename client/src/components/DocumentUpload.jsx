import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DocumentUpload = ({ fileType, onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);

    setLoading(true);
    const toastId = toast.loading(`Uploading ${fileType}...`);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(`${file.name} uploaded!`, { id: toastId });
      onUploadSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [fileType, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg cursor-pointer
      ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600'}
      ${loading ? 'opacity-50' : ''}`}
    >
      <input {...getInputProps()} disabled={loading} />
      {loading ? (
        <p>Processing...</p>
      ) : isDragActive ? (
        <p>Drop the {fileType} here ...</p>
      ) : (
        <p>Drag 'n' drop {fileType} (PDF, max 2MB), or click to select</p>
      )}
    </div>
  );
};

export default DocumentUpload;