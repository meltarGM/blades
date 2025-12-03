import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag, Edit, X } from 'lucide-react';
import './Journal.css';

const Journal = () => {
    // Se asume que useApp() provee updateJournalEntry (ya implementado en AppContext)
    const { data, addJournalEntry, updateJournalEntry, userRole } = useApp(); 
    
    // Estado para controlar el ID de la entrada que se está editando 
    // Valores posibles: null (ningún editor activo), 'new' (editor de nueva entrada arriba), o ID_NUMÉRICO (editor in-place)
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
        setEditingId('new'); // Valor centinela para nueva entrada en la parte superior
        setFormData({ title: '', content: '', tags: '' });
    };

    const startEdit = (entry) => {
        // ID real de la entrada para la edición in-place
        setEditingId(entry.id); 
        setFormData({
            title: entry.title,
            content: entry.content,
            // Convierte el array de tags a string separado por comas para el formulario
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
            const separator = currentTags.length > 0 && formData.tags.trim().slice(-1) !== ',' ? ', ' : '';
            const newTagString = formData.tags + separator + tag;
            setFormData({ ...formData, tags: newTagString });
        }
    };

    const canEdit = userRole === 'GM'; // Solo GM puede agregar/editar
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
                    {editingId === 'new' ? 'Guardar Entrada' : 'Guardar Cambios'}
                </button>
                <button className="btn btn-secondary" onClick={cancelEdit}>
                    <X size={16} style={{ marginRight: '8px' }} />
                    Cancelar
                </button>
            </div>
        </div>
    );

    return (
        <div className="journal-page">
            <header className="page-header">
                <h2>Adventure Journal</h2>
                {/* El botón de nueva entrada solo es visible cuando NO hay un editor activo */}
                {canEdit && editingId === null && (
                    <button className="btn" onClick={startNewEntry}>
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        New Entry
                    </button>
                )}
            </header>

            {/* Renderizar el editor en la parte superior si es una NUEVA entrada */}
            {editingId === 'new' && renderJournalEditor()}

            <div className="journal-list">
                {/* Muestra las entradas en orden inverso para que las nuevas salgan primero */}
                {data.journal.slice().reverse().map(entry => (
                    <React.Fragment key={entry.id}>
                        {/* 1. Si el ID de la entrada coincide con el ID de edición, renderiza el EDITOR */}
                        {entry.id === editingId ? (
                            renderJournalEditor(true)
                        ) : (
                            /* 2. De lo contrario, renderiza la ENTRADA normal */
                            <article className="journal-entry panel">
                                
                                {canEdit && editingId === null && ( // Solo mostrar el botón si NO hay otro editor activo
                                    <div className="entry-actions">
                                        <button className="btn-icon" onClick={() => startEdit(entry)} title="Edit Entry">
                                            <Edit size={16} />
                                        </button>
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
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Journal;