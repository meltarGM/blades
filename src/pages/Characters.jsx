import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dices, Shield, Zap, Brain } from 'lucide-react';
import './Characters.css';

const Characters = () => {
    const { data, updateCharacter, userRole } = useApp();
    const { characters } = data;
    const [activeCharId, setActiveCharId] = useState(characters[0]?.id);
    const [rollResult, setRollResult] = useState(null);

    const activeChar = characters.find(c => c.id === activeCharId);

    const canEdit = (charId) => userRole === 'GM' || userRole === charId;

    const handleUpdate = (field, value) => {
        if (!canEdit(activeCharId)) return;
        updateCharacter(activeCharId, { [field]: value });
    };

    const handleActionUpdate = (actionName, value) => {
        if (!canEdit(activeCharId)) return;
        const newActions = { ...activeChar.actions, [actionName]: value };
        updateCharacter(activeCharId, { actions: newActions });
    };

    const rollAction = (actionName, rating) => {
        const diceCount = rating > 0 ? rating : 2; // 0 rating rolls 2 take lowest, but let's simplify to just rating or 0d logic if needed. BitD rules: 0d = roll 2 take lowest.
        // Simplified implementation:
        const count = Math.max(1, rating); // Placeholder logic
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        const highest = Math.max(...rolls);

        let outcome = '';
        if (rolls.filter(r => r === 6).length >= 2) outcome = 'CRITICAL SUCCESS';
        else if (highest === 6) outcome = 'SUCCESS';
        else if (highest >= 4) outcome = 'PARTIAL SUCCESS';
        else outcome = 'FAILURE';

        setRollResult({ action: actionName, rolls, highest, outcome });
        setTimeout(() => setRollResult(null), 5000);
    };

    if (!activeChar) return <div>No characters found.</div>;

    return (
        <div className="characters-page">
            <div className="char-tabs">
                {characters.map(char => (
                    <button
                        key={char.id}
                        className={`char-tab ${activeCharId === char.id ? 'active' : ''}`}
                        onClick={() => setActiveCharId(char.id)}
                    >
                        {char.name}
                    </button>
                ))}
            </div>

            <div className="character-sheet panel">
                <header className="char-header">
                    <div className="char-identity">
                        <input
                            type="text"
                            className="input-field char-name"
                            value={activeChar.name}
                            onChange={(e) => handleUpdate('name', e.target.value)}
                            disabled={!canEdit(activeChar.id)}
                        />
                        <span className="char-playbook">{activeChar.playbook}</span>
                    </div>
                    <div className="char-stress">
                        <label>Stress</label>
                        <div className="stress-track">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`stress-box ${i < activeChar.stress ? 'filled' : ''}`}
                                    onClick={() => canEdit(activeChar.id) && handleUpdate('stress', i + 1 === activeChar.stress ? i : i + 1)}
                                />
                            ))}
                        </div>
                    </div>
                </header>

                <div className="char-body">
                    <div className="attributes-column">
                        <div className="attribute-block">
                            <div className="attr-header">
                                <Brain size={18} /> <span>Insight</span>
                            </div>
                            <div className="actions-list">
                                {['hunt', 'study', 'survey', 'tinker'].map(action => (
                                    <div key={action} className="action-row">
                                        <button
                                            className="btn-roll"
                                            onClick={() => rollAction(action, activeChar.actions[action])}
                                        >
                                            <Dices size={14} />
                                        </button>
                                        <span className="action-name">{action}</span>
                                        <div className="dots">
                                            {[0, 1, 2, 3].map(d => (
                                                <div
                                                    key={d}
                                                    className={`dot ${d < activeChar.actions[action] ? 'filled' : ''}`}
                                                    onClick={() => canEdit(activeChar.id) && handleActionUpdate(action, d + 1 === activeChar.actions[action] ? d : d + 1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="attribute-block">
                            <div className="attr-header">
                                <Zap size={18} /> <span>Prowess</span>
                            </div>
                            <div className="actions-list">
                                {['finesse', 'prowl', 'skirmish', 'wreck'].map(action => (
                                    <div key={action} className="action-row">
                                        <button
                                            className="btn-roll"
                                            onClick={() => rollAction(action, activeChar.actions[action])}
                                        >
                                            <Dices size={14} />
                                        </button>
                                        <span className="action-name">{action}</span>
                                        <div className="dots">
                                            {[0, 1, 2, 3].map(d => (
                                                <div
                                                    key={d}
                                                    className={`dot ${d < activeChar.actions[action] ? 'filled' : ''}`}
                                                    onClick={() => canEdit(activeChar.id) && handleActionUpdate(action, d + 1 === activeChar.actions[action] ? d : d + 1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="attribute-block">
                            <div className="attr-header">
                                <Shield size={18} /> <span>Resolve</span>
                            </div>
                            <div className="actions-list">
                                {['attune', 'command', 'consort', 'sway'].map(action => (
                                    <div key={action} className="action-row">
                                        <button
                                            className="btn-roll"
                                            onClick={() => rollAction(action, activeChar.actions[action])}
                                        >
                                            <Dices size={14} />
                                        </button>
                                        <span className="action-name">{action}</span>
                                        <div className="dots">
                                            {[0, 1, 2, 3].map(d => (
                                                <div
                                                    key={d}
                                                    className={`dot ${d < activeChar.actions[action] ? 'filled' : ''}`}
                                                    onClick={() => canEdit(activeChar.id) && handleActionUpdate(action, d + 1 === activeChar.actions[action] ? d : d + 1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="gear-column">
                        <h3>Equipment</h3>
                        <div className="items-list">
                            {activeChar.items.map((item, i) => (
                                <div key={i} className="item-row">
                                    <span>{item}</span>
                                </div>
                            ))}
                            {/* Add item input could go here */}
                        </div>
                    </div>
                </div>
            </div>

            {rollResult && (
                <div className="dice-overlay">
                    <div className="dice-result panel">
                        <h3>{rollResult.action.toUpperCase()}</h3>
                        <h4>{rollResult.outcome}</h4>
                        <div className="dice-display">
                            {rollResult.rolls.map((r, i) => (
                                <span key={i} className={`die die-${r}`}>{r}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Characters;
