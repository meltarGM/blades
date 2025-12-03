import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag, Edit, X, Bold, Italic, Underline } from 'lucide-react';

// ⬇️ IMPORTACIONES DE LEXICAL (corregidas para evitar el error de importación) ⬇️
import { 
    LexicalComposer, 
    useLexicalComposerContext 
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// Utilidades de comandos y conversión de HTML
import { $generateHtmlFromNodes, $convertFromHTML } from '@lexical/html';
import { $getRoot, $insertNodes, TextNode, CLEAR_EDITOR_COMMAND } from 'lexical';
import { TOGGLE_BOLD_COMMAND, TOGGLE_ITALIC_COMMAND, TOGGLE_UNDERLINE_COMMAND } from '@lexical/rich-text';
// ⬆️ FIN IMPORTACIONES DE LEXICAL ⬆️

import './Journal.css';


// ====================================================================
// 🛠️ COMPONENTE LEXICAL: BARRA DE HERRAMIENTAS
// ====================================================================

const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    
    // Función de ayuda para envolver los comandos
    const execCommand = (command) => () => editor.dispatchCommand(command, undefined);

    return (
        <div className="toolbar">
            <button 
                onClick={execCommand(TOGGLE_BOLD_COMMAND)}
                className="toolbar-item"
                title="Negrita"
            >
                <Bold size={16} />
            </button>
            <button 
                onClick={execCommand(TOGGLE_ITALIC_COMMAND)}
                className="toolbar-item"
                title="Cursiva"
            >
                <Italic size={16} />
            </button>
            <button 
                onClick={execCommand(TOGGLE_UNDERLINE_COMMAND)}
                className="toolbar-item"
                title="Subrayado"
            >
                <Underline size={16} />
            </button>
            {/* Si deseas más opciones (alineación, etc.), deben añadirse aquí */}
        </div>
    );
}

// ====================================================================
// ⚙️ COMPONENTE LEXICAL: EDITOR PRINCIPAL CON CONVERSIÓN HTML
// ====================================================================

// **Configuración inicial (sin referencia a LexicalTheme)**
const initialConfig = {
    // ❌ Se eliminó la referencia a 'theme' que causaba el error de importación
    nodes: [
        // Nodos necesarios para rich text básico
        TextNode,
    ],
    onError: (error) => {
        console.error("Lexical Error:", error);
    }
};

const JournalTextEditor = ({ initialContent, onChange }) => {
    const [editor] = useLexicalComposerContext();
    
    // 1. Hook para convertir Lexical State a HTML al cambiar el contenido
    const handleChange = useCallback((editorState) => {
        editorState.read(() => {
            // Genera la cadena HTML
            const htmlString = $generateHtmlFromNodes(editor, null);
            onChange(htmlString);
        });
    }, [editor, onChange]);

    // 2. Hook para cargar contenido HTML al iniciar la edición
    useEffect(() => {
        if (initialContent) {
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialContent, 'text/html');
                const nodes = $convertFromHTML(dom);
                
                // Limpia el editor y luego inserta los nodos cargados
                $getRoot().clear();
                $insertNodes(nodes);
            }, { tag: 'initial-load' });
        } else {
             // Limpia el editor para una nueva entrada si no hay contenido inicial
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }
    }, [editor, initialContent]); // Se ejecuta solo cuando el editor o el contenido inicial cambian


    return (
        <>
            <ToolbarPlugin />
            <div className="editor-inner">
                <OnChangePlugin onChange={handleChange} />
                <HistoryPlugin /> 
                
                <RichTextPlugin
                    // ContentEditable sin referencia a MuiContentEditable
                    contentEditable={<ContentEditable className="ContentEditable__root" />}
                    placeholder={
                        <div className="editor-placeholder">Escribe tu entrada de diario...</div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
        </>
    );
};

// ====================================================================
// 🔑 COMPONENTE JOURNAL.JSX (MAIN)
// ====================================================================

const Journal = () => {
    // Se asume que updateJournalEntry está disponible
    const { data, addJournalEntry, updateJournalEntry, userRole } = useApp(); 
    const [editingId, setEditingId] = useState(null); 
    const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

    const allTags = useMemo(() => {
        const tags = new Set();
        data.journal.forEach(entry => {
            entry.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [data.journal]);

    const startNewEntry = () => {
        setEditingId('new'); 
        // El contenido inicial debe ser HTML vacío (Lexical lo convierte a su estado)
        setFormData({ title: '', content: '', tags: '' }); 
    };

    const startEdit = (entry) => {
        setEditingId(entry.id); 
        setFormData({
            title: entry.title,
            // Aseguramos que el contenido sea un string vacío si es null o undefined
            content: entry.content || '', 
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
            const originalEntry = data.journal.find(e => e.id === editingId);
            const updatedEntry = {
                id: editingId,
                title: formData.title,
                date: originalEntry ? originalEntry.date : new Date().toISOString().split('T')[0],
                content: formData.content, // Contenido HTML
                tags: processedTags
            };
            if (updateJournalEntry) {
                updateJournalEntry(updatedEntry);
            }
        } else {
            const newEntry = {
                id: Date.now(),
                title: formData.title,
                date: new Date().toISOString().split('T')[0],
                content: formData.content, // Contenido HTML
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
            
            {/* ⭐️ CONTENEDOR DE LEXICAL COMPOSER ⭐️ */}
            <div className="rich-text-editor-container">
                <LexicalComposer initialConfig={initialConfig}>
                    <JournalTextEditor 
                        initialContent={formData.content} 
                        onChange={(html) => setFormData({ ...formData, content: html })}
                    />
                </LexicalComposer>
            </div>
            {/* ⭐️ FIN CONTENEDOR DE LEXICAL COMPOSER ⭐️ */}

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
                {canEdit && editingId === null && (
                    <button className="btn" onClick={startNewEntry}>
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        New Entry
                    </button>
                )}
            </header>

            {editingId === 'new' && renderJournalEditor()}

            <div className="journal-list">
                {data.journal.slice().reverse().map(entry => (
                    <React.Fragment key={entry.id}>
                        {entry.id === editingId ? (
                            renderJournalEditor(true)
                        ) : (
                            <article className="journal-entry panel">
                                
                                {canEdit && editingId === null && ( 
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
                                    {/* RENDERIZADO DE CONTENIDO HTML */}
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: entry.content }} 
                                        className="rendered-html-content"
                                    />
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