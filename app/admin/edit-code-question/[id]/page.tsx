'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, AlertCircle, CheckCircle, ChevronUp, ChevronDown, Code, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface ContentBlock {
  type: 'code' | 'text';
  code?: string;
  language?: string;
  text_content?: string;
  order: number;
  label?: string;
}

interface ProgrammingTopic {
  _id: string;
  title: string;
  slug: string;
}

function EditCodeQuestion() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingTopics, setFetchingTopics] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [topics, setTopics] = useState<ProgrammingTopic[]>([]);

  const [formData, setFormData] = useState({
    topic_id: '',
    title: '',
    description: '',
    difficulty: 'Medium',
    content_blocks: [{
      type: 'code' as const,
      code: '',
      language: 'python',
      order: 0,
      label: ''
    }] as ContentBlock[],
    order: 0,
    is_active: true
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'bullet' }, { 'list': 'ordered' }],  // Swap order: bullet first
      ['link'],
      ['code-block'],
      ['clean']
    ],
  };

  const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'link', 'code-block'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      document.head.appendChild(link);
      
      // Fix list styles function
      const fixListStyles = () => {
        const editors = document.querySelectorAll('.ql-editor');
        editors.forEach(editor => {
          const uls = editor.querySelectorAll('ul');
          const ols = editor.querySelectorAll('ol');
          uls.forEach(ul => {
            ul.style.listStyleType = 'disc';
            ul.setAttribute('data-list-type', 'bullet');
          });
          ols.forEach(ol => {
            ol.style.listStyleType = 'decimal';
            ol.setAttribute('data-list-type', 'ordered');
          });
        });
      };

      // Use MutationObserver to watch for DOM changes
      const observer = new MutationObserver(() => {
        fixListStyles();
      });

      // Observe all Quill editors
      const observeEditors = () => {
        const editors = document.querySelectorAll('.ql-editor');
        editors.forEach(editor => {
          observer.observe(editor, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
          });
        });
      };

      // Initial fix
      setTimeout(() => {
        fixListStyles();
        observeEditors();
      }, 100);

      // Fix on any content change
      const interval = setInterval(() => {
        fixListStyles();
      }, 500);
      
      return () => {
        const existingLink = document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]');
        if (existingLink) {
          existingLink.remove();
        }
        observer.disconnect();
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
    fetchTopics();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/api/code-questions/admin/${id}`);
      const question = response.data;
      
      setFormData({
        topic_id: question.topic_id?._id || question.topic_id || '',
        title: question.title || '',
        description: question.description || '',
        difficulty: question.difficulty || 'Medium',
        content_blocks: question.content_blocks && question.content_blocks.length > 0
          ? question.content_blocks.map((block: any) => ({
              type: block.type,
              code: block.code || '',
              language: block.language || 'python',
              text_content: block.text_content || '',
              order: block.order || 0,
              label: block.label || ''
            }))
          : [{
              type: 'code' as const,
              code: '',
              language: 'python',
              order: 0,
              label: ''
            }],
        order: question.order || 0,
        is_active: question.is_active !== undefined ? question.is_active : true
      });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load question');
    } finally {
      setFetching(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setFetchingTopics(true);
      const response = await axiosInstance.get('/api/programming-topics/admin/all?limit=100');
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setFetchingTopics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!formData.topic_id || !formData.title.trim()) {
      setError('Topic and title are required');
      setLoading(false);
      return;
    }

    // Validate content blocks
    const hasContent = formData.content_blocks.some(block => {
      if (block.type === 'code') {
        return block.code && block.code.trim().length > 0;
      } else {
        return block.text_content && block.text_content.trim().length > 0;
      }
    });

    if (!hasContent) {
      setError('At least one content block (code or text) is required');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put(`/api/code-questions/admin/${id}`, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/manage-code-questions');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const addContentBlock = (type: 'code' | 'text') => {
    const newOrder = Math.max(...formData.content_blocks.map(b => b.order), -1) + 1;
    const newBlock: ContentBlock = type === 'code' 
      ? { type: 'code', code: '', language: 'python', order: newOrder, label: '' }
      : { type: 'text', text_content: '', order: newOrder };
    
    setFormData({
      ...formData,
      content_blocks: [...formData.content_blocks, newBlock]
    });
  };

  const removeContentBlock = (index: number) => {
    if (formData.content_blocks.length > 1) {
      setFormData({
        ...formData,
        content_blocks: formData.content_blocks.filter((_, i) => i !== index)
      });
    }
  };

  const updateContentBlock = (index: number, updates: Partial<ContentBlock>) => {
    const updated = [...formData.content_blocks];
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, content_blocks: updated });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.content_blocks.length - 1) return;

    const updated = [...formData.content_blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update orders
    updated.forEach((block, i) => {
      block.order = i;
    });
    
    setFormData({ ...formData, content_blocks: updated });
  };


  if (fetching) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1] mb-4"></div>
          <p className="text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 sm:p-6">
      <style>{`
        .ql-toolbar {
          background: #161B33 !important;
          border: 1px solid #374151 !important;
          border-radius: 6px 6px 0 0 !important;
        }
        .ql-container {
          border: 1px solid #374151 !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
          background: #0A0E27 !important;
        }
        .ql-editor {
          color: #ffffff !important;
          font-size: 14px !important;
          min-height: 150px !important;
        }
        .ql-editor.ql-blank::before {
          color: #6b7280 !important;
        }
        .ql-snow .ql-stroke {
          stroke: #ffffff !important;
        }
        .ql-snow .ql-fill {
          fill: #ffffff !important;
        }
        .ql-snow .ql-picker-label {
          color: #ffffff !important;
        }
        .ql-snow .ql-picker-options {
          background: #161B33 !important;
          border: 1px solid #374151 !important;
        }
        .ql-snow .ql-picker-item {
          color: #ffffff !important;
        }
        .ql-snow .ql-picker-item:hover {
          background: #0A0E27 !important;
        }
        .ql-toolbar button:hover,
        .ql-toolbar button:focus,
        .ql-toolbar button.ql-active {
          color: #6366F1 !important;
        }
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button:focus .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #6366F1 !important;
        }
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button:focus .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #6366F1 !important;
        }
        
        /* Styling for formatted content in editor */
        .ql-editor strong {
          font-weight: 700;
          color: #ffffff;
        }
        .ql-editor em {
          font-style: italic;
        }
        .ql-editor u {
          text-decoration: underline;
        }
        .ql-editor code {
          background: #374151;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          color: #fbbf24;
          font-size: 0.9em;
        }
        .ql-editor pre {
          background: #1f2937;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          color: #e5e7eb;
          font-family: 'Courier New', monospace;
        }
        .ql-editor pre.ql-syntax {
          background: #1f2937;
          color: #e5e7eb;
        }
        .ql-editor ul {
          padding-left: 1.5em;
          list-style-type: disc !important;
        }
        .ql-editor ol {
          padding-left: 1.5em;
          list-style-type: decimal !important;
        }
        .ql-editor li {
          margin: 0.5em 0;
          display: list-item !important;
        }
        .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        .ql-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .ql-editor a {
          color: #6366F1;
          text-decoration: underline;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Code Question</h1>
            <p className="text-gray-400 text-sm mt-1">Update code question with multiple code blocks and explanations</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500">Error</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-500">Success!</p>
              <p className="text-sm text-green-400">Question updated successfully. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Topic <span className="text-red-500">*</span>
                </label>
                {fetchingTopics ? (
                  <div className="text-gray-400 text-sm">Loading topics...</div>
                ) : (
                  <select
                    value={formData.topic_id}
                    onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                    className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                    required
                  >
                    <option value="">Select a topic</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>{topic.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => {
                    setFormData({ ...formData, description: value });
                    // Fix list styles after update
                    setTimeout(() => {
                      const editors = document.querySelectorAll('.ql-editor');
                      editors.forEach(editor => {
                        const uls = editor.querySelectorAll('ul');
                        const ols = editor.querySelectorAll('ol');
                        uls.forEach(ul => {
                          ul.style.listStyleType = 'disc';
                        });
                        ols.forEach(ol => {
                          ol.style.listStyleType = 'decimal';
                        });
                      });
                    }, 0);
                  }}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-[#0A0E27]"
                  placeholder="Brief description of the question (can include code snippets)..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#6366F1]"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Blocks Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Content Blocks</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addContentBlock('code')}
                  className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Add Code
                </button>
                <button
                  type="button"
                  onClick={() => addContentBlock('text')}
                  className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Add Text
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.content_blocks.map((block, index) => (
                <div key={index} className="bg-[#0A0E27] rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[#6366F1] text-white text-xs font-bold rounded">
                        {block.type === 'code' ? 'CODE' : 'TEXT'}
                      </span>
                      <span className="text-xs text-gray-400">Block {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === formData.content_blocks.length - 1}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {formData.content_blocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContentBlock(index)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-500"
                          title="Remove block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {block.type === 'code' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Language</label>
                          <input
                            type="text"
                            value={block.language || ''}
                            onChange={(e) => updateContentBlock(index, { language: e.target.value })}
                            className="w-full bg-[#161B33] border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#6366F1]"
                            placeholder="e.g., python, javascript, java, cpp, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Label (optional)</label>
                          <input
                            type="text"
                            value={block.label || ''}
                            onChange={(e) => updateContentBlock(index, { label: e.target.value })}
                            className="w-full bg-[#161B33] border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#6366F1]"
                            placeholder="e.g., Solution 1, Optimized"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Code</label>
                        <textarea
                          value={block.code || ''}
                          onChange={(e) => updateContentBlock(index, { code: e.target.value })}
                          className="w-full bg-[#161B33] border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#6366F1] min-h-[200px]"
                          placeholder="Enter your code here..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium mb-1">Text Content (Explanation)</label>
                      <ReactQuill
                        theme="snow"
                        value={block.text_content || ''}
                        onChange={(value) => {
                          updateContentBlock(index, { text_content: value });
                          // Fix list styles after update
                          setTimeout(() => {
                            const editors = document.querySelectorAll('.ql-editor');
                            editors.forEach(editor => {
                              const uls = editor.querySelectorAll('ul');
                              const ols = editor.querySelectorAll('ol');
                              uls.forEach(ul => {
                                ul.style.listStyleType = 'disc';
                              });
                              ols.forEach(ol => {
                                ol.style.listStyleType = 'decimal';
                              });
                            });
                          }, 0);
                        }}
                        modules={quillModules}
                        formats={quillFormats}
                        className="bg-[#0A0E27]"
                      />
                    </div>
                  )}
                  
                  {/* Add buttons after each block */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        const newOrder = Math.max(...formData.content_blocks.map(b => b.order), -1) + 1;
                        const newBlock: ContentBlock = { 
                          type: 'code', 
                          code: '', 
                          language: 'python', 
                          order: newOrder, 
                          label: '' 
                        };
                        const updated = [...formData.content_blocks];
                        updated.splice(index + 1, 0, newBlock);
                        setFormData({ ...formData, content_blocks: updated });
                      }}
                      className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Code className="w-4 h-4" />
                      Add Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newOrder = Math.max(...formData.content_blocks.map(b => b.order), -1) + 1;
                        const newBlock: ContentBlock = { 
                          type: 'text', 
                          text_content: '', 
                          order: newOrder 
                        };
                        const updated = [...formData.content_blocks];
                        updated.splice(index + 1, 0, newBlock);
                        setFormData({ ...formData, content_blocks: updated });
                      }}
                      className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Add Text
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-[#161B33] rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-[#0A0E27] checked:bg-[#6366F1] focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-0"
              />
              <div>
                <span className="font-medium">Active</span>
                <p className="text-sm text-gray-400">Make this question publicly visible</p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-700 hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5558E3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {loading ? 'Updating...' : 'Update Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCodeQuestion;

