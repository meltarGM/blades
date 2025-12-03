import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag, Edit, X } from 'lucide-react'; // Añadido 'Edit' y 'X' (para Cancelar)
import './Journal.css';

const Journal = () => {
    // Nota: Se asume que useApp() provee updateJournalEntry para guardar los cambios
    const { data, addJournalEntry, updateJournalEntry, userRole } = useApp(); 
    
    // Estado para controlar la visibilidad del editor (Nuevo o Edición)
    const [isEditorActive, setIsEditorActive] = useState(false); 
    // Estado para controlar el ID de la entrada que se está editando (null si es nueva)
    const [editingId, setEditingId] = useState(null);
    // Estado para los datos del formulario (funciona tanto para crear como para editar)
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
        setEditingId(null);
        setFormData({ title: '', content: '', tags: '' });
        setIsEditorActive(true);
    };

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setFormData({
            title: entry.title,
            content: entry.content,
            // Convierte el array de tags a string separado por comas para el formulario
            tags: entry.tags.join(', ')
        });
        setIsEditorActive(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', content: '', tags: '' });
        setIsEditorActive(false);
    };

    const handleSave = () => {
        if (!formData.title || !formData.content) return;

        const processedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        
        if (editingId) {
            // Lógica para ACTUALIZAR
            const originalEntry = data.journal.find(e => e.id === editingId);
            const updatedEntry = {
                id: editingId,
                title: formData.title,
                // Mantiene la fecha original de la entrada
                date: originalEntry ? originalEntry.date : new Date().toISOString().split('T')[0],
                content: formData.content,
                tags: processedTags
            };
            // NECESITAS IMPLEMENTAR updateJournalEntry en AppContext
            if (updateJournalEntry) {
                updateJournalEntry(updatedEntry);
            }
        } else {
            // Lógica para AÑADIR nuevo
            const newEntry = {
                id: Date.now(),
                title: formData.title,
                date: new Date().toISOString().split('T')[0],
                content: formData.content,
                tags: processedTags
            };
            addJournalEntry(newEntry);
        }

        // Reset y cierre del editor
        cancelEdit();
    };

    const handleTagClick = (tag) => {
        const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        // Evita duplicados
        if (!currentTags.includes(tag)) {
            const newTagString = currentTags.join(', ') + (currentTags.length > 0 ? ', ' : '') + tag;
            setFormData({ ...formData, tags: newTagString });
        }
    };

    const canEdit = userRole === 'GM'; // Solo GM puede agregar/editar

    // Determina el título del editor
    const editorTitle = editingId ? 'Editando Entrada' : 'Nueva Entrada';


    return (
        <div className="journal-page">
            <header className="page-header">
                <h2>Adventure Journal</h2>
                {canEdit && !isEditorActive && (
                    <button className="btn" onClick={startNewEntry}>
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        New Entry
                    </button>
                )}
            </header>

            {isEditorActive && (
                <div className="journal-editor panel">
                    <h3>{editorTitle}</h3>
                    <input
                        type="text"
                        placeholder="Entry Title"
                        className="input-field title-input"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Write your adventure..."
                        className="input-field content-input"
                        rows={10}
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                    
                    {/* Sección de Tags y Sugerencias */}
                    <div className="tags-input-container">
                        <Tag size={16} />
                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            className="input-field tags-input"
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                    {allTags.length > 0 && (
                        <div className="tags-suggestion-list">
                            <span>Sugerencias:</span>
                            {allTags.map(tag => (
                                <span 
                                    key={tag} 
                                    className="tag-suggestion" 
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}


                    <div className="editor-actions">
                        <button className="btn" onClick={handleSave}>
                            <Save size={16} style={{ marginRight: '8px' }} />
                            {editingId ? 'Save Changes' : 'Save Entry'}
                        </button>
                        <button className="btn btn-secondary" onClick={cancelEdit}>
                            <X size={16} style={{ marginRight: '8px' }} />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="journal-list">
                {data.journal.slice().reverse().map(entry => ( // Añadido .slice().reverse() para mostrar las nuevas entradas primero
                    <article key={entry.id} className="journal-entry panel">
                        
                        {canEdit && (
                            <div className="entry-actions">
                                <button className="btn-icon" onClick={() => startEdit(entry)} title="Edit Entry">
                                    <Edit size={16} />
                                </button>
                                {/* Puedes añadir un botón para eliminar aquí si lo deseas */}
                            </div>
                        )}

                        <div className="entry-header">
                            <h3>{entry.title}</h3>
                            <span className="entry-date">{entry.date}</span>
                        </div>
                        <div className="entry-content">
                            {entry.content.split('\n').map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                        <div className="entry-footer">
                            <div className="tags">
                                {entry.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Journal;
