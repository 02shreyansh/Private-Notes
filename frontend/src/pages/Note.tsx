import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notesApi, type Note } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, FileText, Trash2, Search } from 'lucide-react';
import NoteEditor from '@/components/NoteEditor';
import { Input } from '@/components/ui/input';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await notesApi.getAll();
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNoteCreated = (note: Note) => {
    setNotes([note, ...notes]);
    setSelectedNote(note);
    setIsCreating(false);
  };

  const handleNoteUpdated = (note: Note) => {
    setNotes(notes.map(n => n.id === note.id ? note : n));
    setSelectedNote(note);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Private Notes</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-80 border-r bg-card/30 flex flex-col">
          <div className="p-4 border-b space-y-3">
            <Button 
              className="w-full" 
              onClick={() => {
                setIsCreating(true);
                setSelectedNote(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsCreating(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg mb-2 transition-all hover:bg-accent group ${
                      selectedNote?.id === note.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1 flex-1">{note.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background">
          {isCreating ? (
            <NoteEditor
              onSave={handleNoteCreated}
              onCancel={() => setIsCreating(false)}
            />
          ) : selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={handleNoteUpdated}
              onCancel={() => setSelectedNote(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Private Notes</h2>
                <p className="text-muted-foreground mb-6">
                  A distraction-free space for your thoughts. Select a note or create a new one to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}