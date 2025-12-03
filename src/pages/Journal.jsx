import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag, Edit, X } from 'lucide-react';

// ⬇️ IMPORTACIONES PARA EL EDITOR DE TEXTO ENRIQUECIDO ⬇️
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilos necesarios para ReactQuill
// ⬆️ FIN IMPORTACIONES RTE ⬆️

import './Journal.css';

const Journal = () => {
    // Se asume que useApp() provee addJournalEntry y updateJournalEntry
    const { data, addJournalEntry, updateJournalEntry, userRole } = useApp(); 
    
    // Estado para controlar qué entrada se está editando
    const [editingId, setEditingId] = useState(null); 
    // Estado para los datos del formulario (Nuevo o Edición)
    const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

    // Calcula todas las etiquetas únicas existentes para las sugerencias
    const allTags = useMemo(() => {
        const tags = new Set();
        data.journal.forEach(entry => {
            entry.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [data.journal]);

    const startNewEntry = () => {
        setEditingId('new'); 
        setFormData({ title: '', content: '', tags: '' });
    };

    const startEdit = (entry) => {
        setEditingId(entry.id); 
        setFormData({
            title: entry.title,
            // El contenido ya es HTML si se guardó con el editor
            content: entry.content, 
            tags: entry.tags.join(', ')
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', content: '', tags: '' });
    };

    const handleSave = () => {
        if (!formData.title || !formData.content) return;

        const processedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        
        if (editingId && editingId !== 'new') {
            // ACTUALIZAR entrada existente
            const originalEntry = data.journal.find(e => e.id === editingId);
            const updatedEntry = {
                id: editingId,
                title: formData.title,
                date: originalEntry ? originalEntry.date : new Date().toISOString().split('T')[0],
                content: formData.content, // Contenido como HTML
                tags: processedTags
            };
            if (updateJournalEntry) {
                updateJournalEntry(updatedEntry);
            }
        } else {
            // AÑADIR nueva entrada
            const newEntry = {
                id: Date.now(),
                title: formData.title,
                date: new Date().toISOString().split('T')[0],
                content: formData.content, // Contenido como HTML
                tags: processedTags
            };
            addJournalEntry(newEntry);
        }

        cancelEdit();
    };

    const handleTagClick = (tag) => {
        const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        if (!currentTags.includes(tag)) {
            const separator = currentTags.length > 0 && formData.tags.trim().slice(-1) !== ',' ? ', ' : '';
            const newTagString = formData.tags + separator + tag;
            setFormData({ ...formData, tags: newTagString });
        }
    };

    const canEdit = userRole === 'GM';
    const editorTitle = editingId === 'new' ? 'Nueva Entrada de Diario' : 'Editando Entrada';

    // Función para renderizar el formulario del editor (reutilizable)
    const renderJournalEditor = (inPlace = false) => (
        <div className={`journal-editor panel ${inPlace ? 'in-place-editor' : ''}`}>
            <h3>{editorTitle}</h3>
            <input
                type="text"
                placeholder="Entry Title"
                className="input-field title-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            
            {/* ⭐️ INTEGRACIÓN DE REACT QUILL ⭐️ */}
            <div className="rich-text-editor-container">
                <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={html => setFormData({ ...formData, content: html })}
                />
            </div>
            {/* ⭐️ FIN INTEGRACIÓN DE REACT QUILL ⭐️ */}

            {/* Sección de Tags y Sugerencias */}
            <div className="tags-input-container">
                <Tag size={16} />
                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    className="input-field tags-input"
                    value={formData.tags}
                    onChange