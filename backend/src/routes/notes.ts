import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, type AuthRequest } from '../middleware/auth';

const router = Router();

// Get all notes for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single note by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new note
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          user_id: req.user!.id,
          title,
          content
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update note
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Note not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
