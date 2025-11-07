'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Trash2, Plus, Edit3, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill-new'),
  { 
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
  }
);

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt: string;
}

const FloatingNotes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | { id: null; title: string; content: string }>({ id: null, title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [showMobileView, setShowMobileView] = useState<'list' | 'editor'>('list');

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
    const savedNotes = localStorage.getItem('userNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }
  }, []);

  const saveToLocalStorage = (notesToSave: Note[]) => {
    localStorage.setItem('userNotes', JSON.stringify(notesToSave));
  };

  const openModal = () => {
    setIsModalOpen(true);
    setShowMobileView('list');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentNote({ id: null, title: '', content: '' });
    setIsEditing(false);
    setSelectedNoteId(null);
    setShowMobileView('list');
  };

  const createNewNote = () => {
    setCurrentNote({ id: null, title: '', content: '' });
    setIsEditing(true);
    setSelectedNoteId(null);
    setShowMobileView('editor');
  };

  const saveNote = () => {
    if (!currentNote.title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    const now = new Date().toISOString();
    let updatedNotes;

    if (currentNote.id) {
      updatedNotes = notes.map(note =>
        note.id === currentNote.id
          ? { ...currentNote, updatedAt: now }
          : note
      );
    } else {
      const newNote = {
        id: Date.now(),
        title: currentNote.title,
        content: currentNote.content,
        createdAt: now,
        updatedAt: now
      };
      updatedNotes = [...notes, newNote];
    }

    setNotes(updatedNotes);
    saveToLocalStorage(updatedNotes);
    setIsEditing(false);
    setCurrentNote({ id: null, title: '', content: '' });
    setShowMobileView('list');
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setSelectedNoteId(note.id);
    setShowMobileView('editor');
  };

  const deleteNote = (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes);
      if (selectedNoteId === noteId) {
        setCurrentNote({ id: null, title: '', content: '' });
        setIsEditing(false);
        setSelectedNoteId(null);
      }
    }
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setShowMobileView('editor');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link' 
  ];

  const goBackToList = () => {
    setShowMobileView('list');
    setIsEditing(false);
  };

  return (
    <>
      {/* Floating Notes Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openModal}
          className="bg-[#C0A063] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          title="Open Notes"
        >
          <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full h-full md:w-[95%] md:h-[95%] md:rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-[#192A41] text-white p-4 md:p-6 flex items-center justify-between md:rounded-t-lg">
              <div className="flex items-center">
                {showMobileView === 'editor' && (
                  <button
                    onClick={goBackToList}
                    className="md:hidden text-white hover:text-[#C0A063] transition-colors p-2 hover:bg-white/10 rounded-full mr-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-xl md:text-2xl font-bold">My Notes</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-[#C0A063] transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Notes List Sidebar */}
              <div className={`${showMobileView === 'list' ? 'w-full' : 'hidden'} md:w-1/3 md:block bg-gray-50 border-r border-gray-200 flex flex-col`}>
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={createNewNote}
                    className="w-full bg-[#C0A063] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Note</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No notes yet. Create your first note!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => selectNote(note)}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedNoteId === note.id
                              ? 'bg-[#C0A063] text-white'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate mb-1">
                                {note.title}
                              </h3>
                              <p className={`text-xs ${
                                selectedNoteId === note.id ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {formatDate(note.updatedAt)}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editNote(note);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                                className="p-1 hover:bg-white/20 rounded text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Note Editor/Viewer */}
              <div className={`${showMobileView === 'editor' ? 'w-full' : 'hidden'} md:flex-1 md:flex md:flex-col`}>
                {isEditing ? (
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <input
                        type="text"
                        value={currentNote.title}
                        onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                        placeholder="Note title..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0A063] focus:border-transparent text-lg font-semibold"
                      />
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      <ReactQuill
                        value={currentNote.content}
                        onChange={(content) => setCurrentNote({ ...currentNote, content })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Start writing your note..."
                        className="h-full [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[calc(100vh-400px)] [&_.ql-container]:max-h-[calc(100vh-400px)]"
                      />
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setShowMobileView('list');
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveNote}
                        className="px-6 py-2 bg-[#C0A063] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    {selectedNoteId ? (
                      <>
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h1 className="text-xl md:text-2xl font-bold text-[#192A41] mb-2">
                                {currentNote.title}
                              </h1>
                              <p className="text-gray-500 text-sm">
                                Last updated: {currentNote.id ? formatDate((currentNote as Note).updatedAt) : 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => editNote(currentNote as unknown as Note)}
                              className="ml-4 p-2 text-[#C0A063] hover:bg-[#C0A063] hover:text-white rounded-full transition-colors"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          <div 
                            className="prose max-w-none quill-content"
                            dangerouslySetInnerHTML={{ __html: currentNote.content }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-xl mb-2">Select a note to view</p>
                          <p>Choose a note from the sidebar or create a new one</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNotes;

