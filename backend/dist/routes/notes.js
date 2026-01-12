"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all notes for authenticated user
router.get('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase_1.supabase
            .from('notes')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Get single note by ID
router.get('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase_1.supabase
            .from('notes')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Note not found' });
            }
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Create new note
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const { data, error } = yield supabase_1.supabase
            .from('notes')
            .insert([
            {
                user_id: req.user.id,
                title,
                content
            }
        ])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Update note
router.put('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const { data, error } = yield supabase_1.supabase
            .from('notes')
            .update({ title, content })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Note not found' });
            }
            throw error;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Delete note
router.delete('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield supabase_1.supabase
            .from('notes')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
