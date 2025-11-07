'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface MixedContentBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

interface CheatsheetItem {
  _id: number;
  title: string;
  description: string;
  category: string;
  content_type: 'code' | 'text' | 'mixed';
  code: string;
  language: string;
  text_content: string;
  mixed_content: MixedContentBlock[];
  order: number;
}

interface FormData {
  title: string;
  slug: string;
  category: string;
  description: string;
  items: CheatsheetItem[];
  categories: string[];
  tags: string[];
  featured: boolean;
  is_active: boolean;
  color: string;
}

function CreateCheatsheet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    category: '',
    description: '',
    items: [{
      _id: Date.now(),
      title: '',
      description: '',
      category: 'basics',
      content_type: 'code',
      code: '',
      language: 'python',
      text_content: '',
      mixed_content: [],
      order: 0
    }],
    categories: [],
    tags: [],
    featured: false,
    is_active: true,
    color: '#3B82F6'
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = ['header', 'bold', 'italic', 'underline', 'list', 'link'];

  useEffect(() => {
    // Load Quill CSS on client side
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      document.head.appendChild(link);
      
      return () => {
        // Cleanup
        const existingLink = document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]');
        if (existingLink) {
          existingLink.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/cheatsheets/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const filteredCategories = categories.filter((cat: string) =>
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const validItems = formData.items.filter(item => {
      if (!item.title.trim() || !item.category.trim()) return false;
      
      switch (item.content_type) {
        case 'code':
          return item.code.trim();
        case 'text':
          return item.text_content.trim();
        case 'mixed':
          return item.mixed_content.length > 0;
        default:
          return false;
      }
    });

    if (validItems.length === 0) {
      setError('At least one valid item is required');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/api/cheatsheets/admin/create', {
        ...formData,
        items: validItems.map((item, index) => {
          const { _id, ...itemData } = item;
          return { ...itemData, order: index };
        })
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/manage-cheatsheets');
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to create cheatsheet');
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        _id: Date.now() + Math.random(),
        title: '',
        description: '',
        category: 'basics',
        content_type: 'code',
        code: '',
        language: 'python',
        text_content: '',
        mixed_content: [],
        order: prev.items.length
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index).map((item, i) => ({
          ...item,
          order: i
        }))
      }));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.items.length - 1)
    ) {
      return;
    }

    const newItems = [...formData.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    newItems.forEach((item, i) => {
      item.order = i;
    });

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addMixedContentBlock = (itemIndex: number) => {
    const item = formData.items[itemIndex];
    const newBlock = { type: 'text', content: '', language: 'python' };
    updateItem(itemIndex, 'mixed_content', [...item.mixed_content, newBlock]);
  };

  const updateMixedContentBlock = (itemIndex: number, blockIndex: number, field: string, value: any) => {
    const item = formData.items[itemIndex];
    const newMixedContent = item.mixed_content.map((block, i) =>
      i === blockIndex ? { ...block, [field]: value } : block
    );
    updateItem(itemIndex, 'mixed_content', newMixedContent);
  };

  const removeMixedContentBlock = (itemIndex: number, blockIndex: number) => {
    const item = formData.items[itemIndex];
    const newMixedContent = item.mixed_content.filter((_, i) => i !== blockIndex);
    updateItem(itemIndex, 'mixed_content', newMixedContent);
  };

  const renderContentEditor = (item: CheatsheetItem, index: number) => {
    switch (item.content_type) {
      case 'code':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
              <select
                value={item.language}
                onChange={(e) => updateItem(index, 'language', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <optgroup label="Formulas & Science">
                  <option value="physics">Physics</option>
                  <option value="formula">Formula</option>
                  <option value="plaintext">Plain Text</option>
                </optgroup>
                <optgroup label="Programming Languages">
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="csharp">C#</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="php">PHP</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="scala">Scala</option>
                  <option value="dart">Dart</option>
                  <option value="perl">Perl</option>
                  <option value="r">R</option>
                  <option value="matlab">MATLAB</option>
                </optgroup>
                <optgroup label="Markup & Config">
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="scss">SCSS/SASS</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="yaml">YAML</option>
                  <option value="toml">TOML</option>
                  <option value="markdown">Markdown</option>
                  <option value="bash">Bash/Shell</option>
                  <option value="powershell">PowerShell</option>
                  <option value="sql">SQL</option>
                  <option value="nosql">NoSQL (MongoDB)</option>
                  <option value="graphql">GraphQL</option>
                  <option value="dockerfile">Dockerfile</option>
                  <option value="nginx">Nginx Config</option>
                  <option value="apache">Apache Config</option>
                  <option value="other">Other</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
              <textarea
                value={item.code}
                onChange={(e) => updateItem(index, 'code', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-300 rounded-md text-green-400 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your code here..."
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Content</label>
            <div className="bg-white rounded-md border border-gray-300">
              <ReactQuill
                value={item.text_content}
                onChange={(content) => updateItem(index, 'text_content', content)}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                placeholder="Enter text content..."
              />
            </div>
          </div>
        );

      case 'mixed':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Mixed Content</label>
              <button
                type="button"
                onClick={() => addMixedContentBlock(index)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Block
              </button>
            </div>
            
            {item.mixed_content.map((block, blockIndex) => (
              <div key={blockIndex} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <select
                    value={block.type}
                    onChange={(e) => updateMixedContentBlock(index, blockIndex, 'type', e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="code">Code</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMixedContentBlock(index, blockIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                {block.type === 'code' && (
                  <select
                    value={block.language || 'python'}
                    onChange={(e) => updateMixedContentBlock(index, blockIndex, 'language', e.target.value)}
                    className="w-full mb-2 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <optgroup label="Formulas & Science">
                      <option value="physics">Physics</option>
                      <option value="formula">Formula</option>
                      <option value="plaintext">Plain Text</option>
                    </optgroup>
                    <optgroup label="Programming Languages">
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="csharp">C#</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="php">PHP</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="scala">Scala</option>
                      <option value="dart">Dart</option>
                      <option value="perl">Perl</option>
                      <option value="r">R</option>
                      <option value="matlab">MATLAB</option>
                    </optgroup>
                    <optgroup label="Markup & Config">
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="scss">SCSS/SASS</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                      <option value="yaml">YAML</option>
                      <option value="toml">TOML</option>
                      <option value="markdown">Markdown</option>
                      <option value="bash">Bash/Shell</option>
                      <option value="powershell">PowerShell</option>
                      <option value="sql">SQL</option>
                      <option value="nosql">NoSQL (MongoDB)</option>
                      <option value="graphql">GraphQL</option>
                      <option value="dockerfile">Dockerfile</option>
                      <option value="nginx">Nginx Config</option>
                      <option value="apache">Apache Config</option>
                      <option value="other">Other</option>
                    </optgroup>
                  </select>
                )}
                
                <textarea
                  value={block.content}
                  onChange={(e) => updateMixedContentBlock(index, blockIndex, 'content', e.target.value)}
                  rows={block.type === 'code' ? 5 : 3}
                  className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    block.type === 'code' ? 'bg-gray-900 text-green-400 font-mono' : 'bg-white'
                  }`}
                  placeholder={block.type === 'code' ? 'Enter code...' : 'Enter text...'}
                />
              </div>
            ))}
            
            {item.mixed_content.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">No content blocks yet</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div>
          <button onClick={() => router.push('/admin/manage-cheatsheets')} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4 mt-20"> <ArrowLeft className="h-4 w-4" /> Back</button>
        </div>
        {/* Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Cheatsheet created successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form id="cheatsheet-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Python Cheatsheet"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData(prev => ({ ...prev, slug: e.target.value }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="python-cheatsheet"
                />
              </div>
              
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, category: e.target.value }));
                    setShowCategorySuggestions(true);
                  }}
                  onFocus={() => setShowCategorySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                  placeholder="Programming"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                
                {showCategorySuggestions && formData.category && filteredCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-40 overflow-y-auto">
                    {filteredCategories.map((cat, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: cat }));
                          setShowCategorySuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-9 px-2 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief description..."
              />
            </div>

            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Active
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Featured
              </label>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Filter Categories</h2>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, categories: [...prev.categories, ''] }))}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.categories.map((cat, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      categories: prev.categories.map((c, idx) => idx === i ? e.target.value : c)
                    }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="basics, advanced, functions"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      categories: prev.categories.filter((_, idx) => idx !== i)
                    }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.categories.length === 0 && (
                <p className="text-xs text-gray-500">No filter categories added</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Content Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={item._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === formData.items.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-gray-600">Item {index + 1}</span>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Variables"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="basics"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Brief description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Content Type *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'content_type', 'code')}
                          className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                            item.content_type === 'code'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Code
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'content_type', 'text')}
                          className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                            item.content_type === 'text'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'content_type', 'mixed')}
                          className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                            item.content_type === 'mixed'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Mixed
                        </button>
                      </div>
                    </div>
                    
                    {renderContentEditor(item, index)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Tags</h2>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }))}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.tags.map((tag, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.map((t, idx) => idx === i ? e.target.value : t)
                    }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter tag"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, idx) => idx !== i)
                    }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateCheatsheet;