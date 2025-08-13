import { useState, useEffect } from 'react';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { isAuthenticated } = useAuth(); 
  const router = useRouter();

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉',
    '🚀', '💻', '⚡', '🎯', '💡', '🔧', '📚', '🎨', '🎵', '🎮',
    '😎', '🤓', '😴', '😭', '😡', '🤯', '🤩', '🥳', '😇', '🤗'
  ];

  useEffect(() => {
    if (!isAuthenticated) { 
      router.push('/login');
    }
  }, [isAuthenticated, router]); 

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > 5) {
      alert('Maximum 5 files allowed per post.');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word') || file.type.includes('document')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📈';
    return '📎';
  };

  const insertEmoji = (emoji) => {
    setContentMarkdown(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !contentMarkdown.trim()) {
      alert('Please fill in both title and content.');
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem('token'); 
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('contentMarkdown', contentMarkdown);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post('/posts', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-center mt-8">Redirecting to login...</p>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Create a Post</h2>
      
      <div className="mb-4">
        <label className="block text-base font-semibold text-gray-700 mb-2">Title</label>
        <input 
          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Enter your post title" 
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-base font-semibold text-gray-700">Content</label>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-2xl hover:scale-110 transition-transform"
              title="Add emoji"
            >
              😀
            </button>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer p-1 rounded hover:bg-gray-200"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      
        {showPreview ? (
          <div className="border border-gray-300 rounded-lg p-3 w-full h-64 bg-white overflow-y-auto resize-y">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contentMarkdown || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <textarea 
            className="border border-gray-300 rounded-lg p-3 w-full h-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" 
            value={contentMarkdown} 
            onChange={e => setContentMarkdown(e.target.value)}
            placeholder="Write your post content using markdown, tips are : # ## ### for headers, **text** for bold, *text* for italics, - item for bullet lists, [text](url) for links"
          />
        )}
      </div>

      {/* File Upload Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="cursor-pointer">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            />
            <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm font-medium">Add Files</span>
            </div>
          </label>
        </div>

        {/* File List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getFileIcon(file)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSubmit}
          disabled={!title.trim() || !contentMarkdown.trim() || isUploading}>
          {isUploading ? 'Creating Post...' : 'Create Post'}
        </button>
        <button 
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors" 
          onClick={() => router.push('/')}
          disabled={isUploading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}