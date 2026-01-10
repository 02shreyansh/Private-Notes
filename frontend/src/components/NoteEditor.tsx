import { useState, useEffect, useCallback } from 'react';
import { notesApi, type Note } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Clock } from 'lucide-react';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(note ? new Date(note.updated_at) : null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!note || !title.trim() || !content.trim()) return;
    
    setAutoSaving(true);
    try {
      const response = await notesApi.update(note.id, { title, content });
      onSave(response.data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [note, title, content, onSave]);

  // Auto-save debounce
  useEffect(() => {
    if (!note) return;
    
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        autoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, note, autoSave]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setSaving(true);
    try {
      if (note) {
        const response = await notesApi.update(note.id, { title, content });
        onSave(response.data);
      } else {
        const response = await notesApi.create({ title, content });
        onSave(response.data);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Editor Header */}
      <div className="border-b bg-card/30 backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {note && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {autoSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Clock className="w-3 h-3" />
                  <span>Saved {formatLastSaved()}</span>
                </>
              ) : null}
            </div>
          )}
          
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button size="sm" onClick={handleSave} disabled={saving || autoSaving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : note ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Textarea
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[calc(100vh-240px)] border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}