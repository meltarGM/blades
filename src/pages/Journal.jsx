import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag, Edit, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// ⬇️ IMPORTACIONES DE LEXICAL ⬇️
import { 
    LexicalComposer,
    // Importamos useLexicalNodeSelection para manejar el estado de selección
    useLexicalNodeSelection
} from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'; 
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// Utilidades de comandos y conversión de HTML
import * as HtmlUtils from '@lexical/html';
import { 
    $getRoot, 
    TextNode, 
    CLEAR_EDITOR_COMMAND, 
    // Comandos de alineación
    COMMAND_PRIORITY_CRITICAL,
    SELECTION_CHANGE_COMMAND,
    FORMAT_ELEMENT_COMMAND 
} from 'lexical';

import { $insertNodes } from 'lexical'; // Importar $insertNodes desde lexical (estaba mal colocado)

// ⬆️ FIN IMPORTACIONES DE LEXICAL ⬆️

import './Journal.css';


// ====================================================================
// 🛠️ COMPONENTE LEXICAL: BARRA DE HERRAMIENTAS
// ====================================================================

const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext(); 
    // Estado para gestionar los estilos activos
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [elementFormat, setElementFormat] = useState('left');

    // Función que se ejecuta en cada cambio de selección o contenido
    const updateToolbar = useCallback(() => {
        const selection = editor.getEditorState().read(() => $getRoot().getSelection());

        if (selection) {
            const format = selection.getFormat();
            setIsBold(format.hasFormat('bold'));
            setIsItalic(format.hasFormat('italic'));
            setIsUnderline(format.hasFormat('underline'));

            const element = selection.getNodes()[0].getTopLevelElementOrThrow();
            const align = element.getFormatType();
            setElementFormat(align);
        }
    }, [editor]);

    // Registro de listeners para actualizar el estado
    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }, [editor, updateToolbar]);

    // Función de ayuda para envolver los comandos
    const execCommand = (command, payload) => () => activeEditor.dispatchCommand(command, payload);

    return (
        <div className="toolbar">
            {/* Botones de formato de texto (usando las cadenas crudas como fix) */}
            <button 
                onClick={execCommand('toggleBold')}
                className={`toolbar-item ${isBold ? 'active' : ''}`}
                title="Negrita"
            >
                <Bold size={16} />
            </button>
            <button 
                onClick={execCommand('toggleItalic')}
                className={`toolbar-item ${isItalic ? 'active' : ''}`}
                title="Cursiva"
            >
                <Italic size={16} />
            </button>
            <button 
                onClick={execCommand('toggleUnderline')}
                className={`toolbar-item ${isUnderline ? 'active' : ''}`}
                title="Subrayado"
            >
                <Underline size={16} />
            </button>

            {/* Separador visual */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }}></div>

            {/* Botones de alineación */}
            <button 
                onClick={execCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                className={`toolbar-item ${elementFormat === 'left' ? 'active' : ''}`}
                title="Alinear a la izquierda"
            >
                <AlignLeft size={16} />
            </button>
            <button 
                onClick={execCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                className={`toolbar-item ${elementFormat === 'center' ? 'active' : ''}`}
                title="Centrar"
            >
                <AlignCenter size={16} />
            </button>
            <button 
                onClick={execCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                className={`toolbar-item ${elementFormat === 'right' ? 'active' : ''}`}
                title="Alinear a la derecha"
            >
                <AlignRight size={16} />
            </button>
        </div>
    );
}

// ====================================================================
// ⚙️ COMPONENTE LEXICAL: EDITOR PRINCIPAL CON CONVERSIÓN HTML
// ====================================================================

const initialConfig = {
    // Añadimos 'text' y 'element' a los posibles formatos para soportar alineación
    namespace: 'JournalEditor',
    theme: {
        text: {
            bold: 'text-bold',
            italic: 'text-italic',
            underline: 'text-underline',
        },
        // Estilos de alineación (se definen en CSS)
        element: {
            left: 'align-left',
            center: 'align-center',
            right: 'align-right',
        }
    },
    nodes: [
        TextNode,
    ],
    onError: (error) => {
        console.error("Lexical Error:", error);
    }
};

const JournalTextEditor = ({ initialContent, onChange }) => {
    const [editor] = useLexicalComposerContext();
    
    const handleChange = useCallback((editorState) => {
        editorState.read(() => {
            const htmlString = HtmlUtils.$generateHtmlFromNodes(editor, null);
            onChange(htmlString);
        });
    }, [editor, onChange]);

    useEffect(() => {
        if (initialContent) {
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialContent, 'text/html');
                
                const nodes = HtmlUtils.$convertFromHTML(dom);
                
                $getRoot().clear();
                $insertNodes(nodes);
            }, { tag: 'initial-load' });
        } else {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        }
    }, [editor, initialContent]);

    return (
        <>
            <ToolbarPlugin />
            <div className="editor-inner">
                <OnChangePlugin onChange={handleChange} />
                <HistoryPlugin /> 
                
                <RichTextPlugin
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
        setFormData({ title: '', content: '', tags: '' }); 
    };

    const startEdit = (entry) => {
        setEditingId(entry.id); 
        setFormData({
            title: entry.title,
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
                content: formData.content,
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
                content: formData.content,
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
            
            <div className="rich-text-editor-container">
                <LexicalComposer initialConfig={initialConfig}>
                    <JournalTextEditor 
                        initialContent={formData.content} 
                        onChange={(html) => setFormData({ ...formData, content: html })}
                    />
                </LexicalComposer>
            </div>

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