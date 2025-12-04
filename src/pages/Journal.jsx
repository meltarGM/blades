import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
    Plus, Save, Tag, Edit3, X, Bold, Italic, List, 
    Underline, AlignLeft, AlignCenter, AlignRight,
    ListOrdered,
    Trash2
} from 'lucide-react';
import './Journal.css';

// --------------------------------------------------------------------------------
// LEXICAL IMPORTS Y UTILIDADES
// --------------------------------------------------------------------------------

import {
    $getRoot, $getSelection,
    createEditor, 
    ParagraphNode, 
    TextNode, 
    LineBreakNode, 
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
} from 'lexical';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'; 
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';

import { 
    ListItemNode, 
    ListNode, 
    INSERT_UNORDERED_LIST_COMMAND, 
    INSERT_ORDERED_LIST_COMMAND, 
} from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';

import { ElementNode, $isElementNode } from 'lexical'; 
import { 
    FORMAT_ELEMENT_COMMAND,
} from 'lexical';


// --------------------------------------------------------------------------------
// CONFIGURACIÓN Y UTILIDADES
// --------------------------------------------------------------------------------

const editorConfig = {
    nodes: [
        ParagraphNode, 
        TextNode,
        LineBreakNode, 
        HeadingNode, 
        ListNode,
        ListItemNode,
        LinkNode,
    ],
    theme: {
        paragraph: 'editor-paragraph', 
        textAlignCenter: 'text-align-center',
        textAlignRight: 'text-align-right',
        textAlignLeft: 'text-align-left',
        
        heading: {
            h1: 'editor-h1', 
            h2: 'editor-h2',
            h3: 'editor-h3',
            h4: 'editor-h4',
            h5: 'editor-h5',
            h6: 'editor-h6',
        },
        list: {
            ul: 'editor-ul', 
            ol: 'editor-ol', 
        },
        listItem: 'editor-listitem',
        link: 'editor-link',
    },
    onError: (error) => {
        console.error('Lexical Editor Error Captured:', error);
    },
};

const isLexicalJson = (str) => {
    if (typeof str !== 'string' || str.trim().length === 0) return false;
    try {
        const obj = JSON.parse(str);
        return obj && typeof obj === 'object' && obj.root && obj.root.type === 'root';
    } catch (e) {
        return false;
    }
};


// --------------------------------------------------------------------------------
// PLUGIN: BARRA DE HERRAMIENTAS (TOOLBAR)
// --------------------------------------------------------------------------------

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));

            const anchorNode = selection.anchor.getNode();
            
            let element = anchorNode.getTopLevelElement();
            if (!element) {
                element = $getRoot();
            }

            if (element) {
                let type = element.getFormatType(); 

                if (element.getType() === 'listitem') {
                     const parent = element.getParent();
                     if (parent) {
                        type = parent.getFormatType() || parent.getType(); 
                     }
                }
                
                if (!type || type === 'left') {
                    type = element.getType() || 'paragraph';
                }

                setBlockType(type);
            }
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const applyFormat = useCallback((format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    }, [editor]);
    
    const insertUnorderedList = useCallback((e) => {
        e.preventDefault();
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }, [editor]);
    
    const insertOrderedList = useCallback((e) => {
        e.preventDefault();
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }, [editor]);

    const applyAlign = useCallback((alignType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignType);
    }, [editor]);


    return (
        <div className="toolbar"> 
            {/* Formato de Texto */}
            <button
                onClick={(e) => { e.preventDefault(); applyFormat('bold'); }}
                className={`toolbar-item ${isBold ? 'active' : ''}`}
                aria-label="Format Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); applyFormat('italic'); }}
                className={`toolbar-item ${isItalic ? 'active' : ''}`}
                aria-label="Format Italic"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); applyFormat('underline'); }}
                className={`toolbar-item ${isUnderline ? 'active' : ''}`}
                aria-label="Format Underline"
            >
                <Underline size={16} />
            </button>
            
            <span className="toolbar-separator" />
            
            {/* Listas */}
            <button
                onClick={insertUnorderedList}
                className="toolbar-item"
                aria-label="Unordered List"
            >
                <List size={16} />
            </button>
             <button 
                onClick={insertOrderedList}
                className="toolbar-item"
                aria-label="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
            
            <span className="toolbar-separator" />

            {/* Alineación */}
            <button
                onClick={(e) => { e.preventDefault(); applyAlign('left'); }}
                className={`toolbar-item ${blockType === 'left' || blockType === 'paragraph' ? 'active' : ''}`}
                aria-label="Align Left"
            >
                <AlignLeft size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); applyAlign('center'); }}
                className={`toolbar-item ${blockType === 'center' ? 'active' : ''}`}
                aria-label="Align Center"
            >
                <AlignCenter size={16} />
            </button>
            <button
                onClick={(e) => { e.preventDefault(); applyAlign('right'); }}
                className={`toolbar-item ${blockType === 'right' ? 'active' : ''}`}
                aria-label="Align Right"
            >
                <AlignRight size={16} />
            </button>
        </div>
    );
}

// --------------------------------------------------------------------------------
// PLUGIN: SERIALIZACIÓN DE CONTENIDO
// --------------------------------------------------------------------------------

const ContentSerializerPlugin = ({ onContentChange }) => {
    return (
        <OnChangePlugin 
            onChange={(editorState, editor) => {
                editorState.read(() => {
                    const editorStateJSON = JSON.stringify(editorState.toJSON());
                    onContentChange(editorStateJSON);
                });
            }} 
        />
    );
};


// --------------------------------------------------------------------------------
// COMPONENTE EDITOR LEXICAL (MEMOIZADO)
// --------------------------------------------------------------------------------

const JournalEditor = React.memo(function JournalEditor({ initialContent, onContentChange }) {
    
    const initialConfig = useMemo(() => {
        return {
            ...editorConfig,
            editorState: (editor) => {
                if (initialContent && isLexicalJson(initialContent)) {
                    try {
                        const editorState = editor.parseEditorState(initialContent);
                        editor.setEditorState(editorState); 
                    } catch (e) {
                        console.error("Failed to set initial Lexical state:", e);
                    }
                }
            }
        };
    }, []); 

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin />
            <div className="editor-container panel content-input">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="content-editable" />}
                    placeholder={<div className="editor-placeholder">Write your adventure entry here...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <AutoFocusPlugin /> 
                <ContentSerializerPlugin onContentChange={onContentChange} />
            </div>
        </LexicalComposer>
    );
});


// --------------------------------------------------------------------------------
// COMPONENTE DE EDICIÓN DEL DIARIO (EXTRAÍDO Y MEMOIZADO)
// --------------------------------------------------------------------------------

const JournalEditorComponent = React.memo(function JournalEditorComponent({
    entryId,
    newEntryTitle,
    setNewEntryTitle,
    newEntryTags,
    setNewEntryTags,
    editorContent,
    handleContentChange,
    handleSave,
    handleCancel,
    handleDelete,
    getSuggestions, // ⬅️ NEW PROP
    handleTagSuggestionSelect // ⬅️ NEW PROP
}) {
    // Calcula las sugerencias cada vez que el componente se renderiza (solo si las props cambian)
    const suggestions = getSuggestions();

    return (
        <article key={entryId || 'new'} className="journal-entry panel"> 
            <div className="journal-editor">
                <input
                    type="text"
                    className="title-input"
                    placeholder="Entry Title"
                    value={newEntryTitle}
                    onChange={(e) => setNewEntryTitle(e.target.value)}
                />

                <JournalEditor
                    key={entryId || 'new-entry-editor'} 
                    initialContent={editorContent} 
                    onContentChange={handleContentChange} 
                />
                
                <div className="tags-input-container">
                    <Tag size={16} />
                    <div className="tags-input-wrapper">
                        <input
                            type="text"
                            className="tags-input"
                            placeholder="Tags (comma separated, e.g., 'NPC, Combat')"
                            value={newEntryTags}
                            onChange={(e) => setNewEntryTags(e.target.value)}
                        />
                        
                        {/* ⬇️ Lógica de Sugerencias ⬇️ */}
                        {suggestions.length > 0 && (
                            <div className="tag-suggestions-list">
                                {suggestions.map(tag => (
                                    <div 
                                        key={tag}
                                        className="tag-suggestion-item"
                                        // Usamos onMouseDown para evitar que se dispare el evento blur del input
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Evita perder el foco del input
                                            handleTagSuggestionSelect(tag);
                                        }}
                                        onClick={() => handleTagSuggestionSelect(tag)} // Fallback click
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* ⬆️ Lógica de Sugerencias ⬆️ */}
                    </div>
                </div>

                <div className="editor-actions">
                    <button className="btn" onClick={handleSave}>
                        <Save size={16} style={{ marginRight: '8px' }} />
                        {entryId ? 'Update Entry' : 'Save Entry'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                        <X size={16} style={{ marginRight: '8px' }} />
                        Cancel
                    </button>
                    
                    {entryId && (
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDelete} 
                            style={{ marginLeft: 'auto' }}
                        >
                            <Trash2 size={16} style={{ marginRight: '8px' }} />
                            Delete Entry
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
});


// --------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Journal)
// --------------------------------------------------------------------------------

const Journal = () => {
    const { data, addJournalEntry, updateJournalEntry, deleteJournalEntry, userRole } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    
    const [newEntryTitle, setNewEntryTitle] = useState('');
    const [newEntryTags, setNewEntryTags] = useState('');

    const [editingEntryId, setEditingEntryId] = useState(null); 
    
    const [editorContent, setEditorContent] = useState(null); 
    const editorContentRef = React.useRef(null);
    editorContentRef.current = editorContent; 

    const utilityEditor = useMemo(() => createEditor(editorConfig), []);

    // ⬇️ LÓGICA DE SUGERENCIA DE ETIQUETAS ⬇️

    // 1. Calcula todas las etiquetas únicas existentes (estable)
    const allTags = useMemo(() => {
        const tagsSet = new Set();
        data.journal.forEach(entry => {
            if (Array.isArray(entry.tags)) {
                entry.tags.forEach(tag => tagsSet.add(tag.trim()));
            }
        });
        return Array.from(tagsSet).filter(t => t.length > 0);
    }, [data.journal]);

    // 2. Función para obtener sugerencias basadas en el input (estable)
    const getSuggestions = useCallback(() => {
        const input = newEntryTags.trim();
        if (!input) return [];

        // Encuentra la última etiqueta parcial
        const parts = input.split(',');
        const partialTag = parts[parts.length - 1].trim().toLowerCase();

        if (partialTag.length === 0) return [];

        // Filtra las etiquetas existentes que NO son la que se está escribiendo actualmente
        return allTags
            .filter(tag => 
                tag.toLowerCase().startsWith(partialTag) && 
                tag.toLowerCase() !== partialTag
            );
    }, [newEntryTags, allTags]);

    // 3. Función para seleccionar una sugerencia (estable)
    const handleTagSuggestionSelect = useCallback((selectedTag) => {
        const input = newEntryTags;
        const lastCommaIndex = input.lastIndexOf(',');
        
        let newTagsValue;
        
        if (lastCommaIndex !== -1) {
            // Reemplaza la etiqueta parcial por la completa
            const prefix = input.substring(0, lastCommaIndex + 1).trim();
            newTagsValue = prefix + ', ' + selectedTag;
        } else {
            // Si no hay coma, reemplaza el input completo
            newTagsValue = selectedTag;
        }

        // Añade una coma al final para facilitar la escritura de la siguiente etiqueta
        setNewEntryTags(newTagsValue.replace(/, +/g, ', ').trimStart() + ', ');
        
    }, [newEntryTags, setNewEntryTags]);
    
    // ⬆️ FIN LÓGICA DE SUGERENCIA DE ETIQUETAS ⬆️


    // Funciones de parseo (getPlainTextContent y getHTMLFromState)
    const getPlainTextContent = useCallback((contentJSON) => {
        if (!contentJSON || !isLexicalJson(contentJSON)) return ''; 
        try {
            const editorState = utilityEditor.parseEditorState(contentJSON);
            let plainText = '';
            editorState.read(() => {
                const root = $getRoot();
                plainText = root.getTextContent(); 
            });
            return plainText.trim();
        } catch (e) {
            return '';
        }
    }, [utilityEditor]);

    const getHTMLFromState = useCallback((editorStateJSON) => {
        if (!editorStateJSON) return { __html: '' };
        
        if (isLexicalJson(editorStateJSON)) {
            try {
                const editorState = utilityEditor.parseEditorState(editorStateJSON);
                let html = '';

                editorState.read(() => {
                    html = $generateHtmlFromNodes(utilityEditor, null); 
                });

                return { __html: html };

            } catch (e) {
                console.error('Lexical State JSON Structure Error:', e);
                return { __html: `<p>Error al cargar contenido de Lexical (corrupto).</p>` };
            }
        } else {
            if (editorStateJSON && editorStateJSON.trim().startsWith('<')) {
                return { __html: editorStateJSON };
            }
            
            if (editorStateJSON) {
                const paragraphs = editorStateJSON.split('\n').map(p => `<p>${p}</p>`).join('');
                return { __html: paragraphs };
            }
            return { __html: '' };
        }
    }, [utilityEditor]);

    const handleContentChange = useCallback((jsonString) => {
        setEditorContent(jsonString);
    }, []);
    
    const resetStates = useCallback(() => {
        setIsEditing(false);
        setEditingEntryId(null); 
        setNewEntryTitle('');
        setNewEntryTags('');
        setEditorContent(null);
    }, []);

    const handleSave = useCallback(() => {
        const contentToSave = editorContentRef.current;
        const plainTextContent = getPlainTextContent(contentToSave);
        
        if (!newEntryTitle.trim() || !plainTextContent) {
            console.warn("Save cancelled: Title or content is empty.");
            return;
        }

        const entryUpdates = {
            title: newEntryTitle.trim(),
            content: contentToSave, 
            tags: newEntryTags.split(',').map(t => t.trim()).filter(t => t)
        };

        if (editingEntryId) {
            const originalEntry = data.journal.find(e => String(e.id) === String(editingEntryId)); 
            const updatedEntry = { 
                id: editingEntryId, 
                date: originalEntry?.date || new Date().toISOString().split('T')[0], 
                ...entryUpdates 
            };
            updateJournalEntry(updatedEntry);
        } else {
            const newEntryWithId = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                ...entryUpdates
            };
            addJournalEntry(newEntryWithId);
        }

        resetStates();
    }, [newEntryTitle, newEntryTags, editingEntryId, data.journal, updateJournalEntry, addJournalEntry, resetStates, getPlainTextContent]);

    const handleDelete = useCallback(() => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta entrada del diario?")) {
            deleteJournalEntry(editingEntryId); 
            resetStates();
        }
    }, [editingEntryId, deleteJournalEntry, resetStates]);
    
    const handleEditClick = useCallback((entry) => {
        setIsEditing(true);
        setEditingEntryId(entry.id);
        setNewEntryTitle(entry.title);
        setNewEntryTags(entry.tags.join(', '));
        setEditorContent(entry.content); 
    }, []);
    
    const handleCancel = useCallback(() => {
        resetStates();
    }, [resetStates]);

    const canEdit = userRole === 'GM';
    
    // Propiedades comunes para el EditorComponent (Memoizado para evitar re-render)
    const editorProps = useMemo(() => ({
        newEntryTitle,
        setNewEntryTitle,
        newEntryTags,
        setNewEntryTags,
        editorContent,
        handleContentChange,
        handleSave,
        handleCancel,
        handleDelete,
        getSuggestions, // ⬅️ NEW
        handleTagSuggestionSelect // ⬅️ NEW
    }), [
        newEntryTitle, 
        setNewEntryTitle, 
        newEntryTags, 
        setNewEntryTags, 
        editorContent,
        handleContentChange, 
        handleSave, 
        handleCancel, 
        handleDelete,
        getSuggestions, 
        handleTagSuggestionSelect
    ]);


    return (
        <div className="journal-page">
            <header className="page-header">
                <h2>Adventure Journal</h2>
                {canEdit && !isEditing && (
                    <button className="btn" onClick={() => setIsEditing(true)}>
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        New Entry
                    </button>
                )}
            </header>

            <div className="journal-list">
                {/* Nueva Entrada */}
                {isEditing && !editingEntryId && (
                    <JournalEditorComponent 
                        entryId={null}
                        {...editorProps}
                    />
                )}

                {/* Mapea y Renderiza Entradas */}
                {data.journal.map(entry => {
                    
                    if (editingEntryId === entry.id) {
                        // Entrada en modo Edición
                        return (
                             <JournalEditorComponent 
                                key={entry.id} 
                                entryId={entry.id} 
                                {...editorProps}
                            />
                        );
                    }

                    // Entrada en modo Lectura
                    return (
                        <article key={entry.id} className="journal-entry panel">
                            <div className="entry-header">
                                <h3>{entry.title}</h3>
                                <span className="entry-date">{entry.date}</span>
                            </div>
                            
                            <div 
                                className="entry-content"
                                dangerouslySetInnerHTML={getHTMLFromState(entry.content)}
                            />

                            <div className="entry-footer">
                                <div className="tags">
                                    {entry.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                                {canEdit && (
                                    <button className="btn-icon" onClick={() => handleEditClick(entry)}>
                                        <Edit3 size={16} />
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default Journal;