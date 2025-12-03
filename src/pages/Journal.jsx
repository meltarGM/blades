import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Save, Tag } from 'lucide-react';
import './Journal.css';

const Journal = () => {
    const { data, addJournalEntry, userRole } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [newEntry, setNewEntry] = useState({ title: '', content: '', tags: '' });

    const handleSave = () => {
        if (!newEntry.title || !newEntry.content) return;

        const entry = {
            id: Date.now(),
            title: newEntry.title,
            date: new Date().toISOString().split('T')[0],
            content: newEntry.content,
            tags: newEntry.tags.split(',').map(t => t.trim()).filter(t => t)
        };

        addJournalEntry(entry);
        setIsEditing(false);
        setNewEntry({ title: '', content: '', tags: '' });
    };

    const canEdit = userRole === 'GM'; // Only GM can add entries for now, or maybe players too? User said "Diario... funcionará como un blog". Let's allow GM.

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

            {isEditing && (
                <div className="journal-editor panel">
                    <input
                        type="text"
                        placeholder="Entry Title"
                        className="input-field title-input"
                        value={newEntry.title}
                        onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Write your adventure..."
                        className="input-field content-input"
                        rows={10}
                        value={newEntry.content}
                        onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                    />
                    <div className="tags-input-container">
                        <Tag size={16} />
                        <input
                            type="text"
                            placeholder="Tags (comma separated)"
                            className="input-field tags-input"
                            value={newEntry.tags}
                            onChange={e => setNewEntry({ ...newEntry, tags: e.target.value })}
                        />
                    </div>
                    <div className="editor-actions">
                        <button className="btn" onClick={handleSave}>
                            <Save size={16} style={{ marginRight: '8px' }} />
                            Save Entry
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="journal-list">
                {data.journal.map(entry => (
                    <article key={entry.id} className="journal-entry panel">
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
