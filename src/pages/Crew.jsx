import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Flame, Coins, Trophy, Dices } from 'lucide-react';
import './Crew.css';

const Crew = () => {
    const { data, updateCrew, userRole } = useApp();
    const { crew } = data;
    const [rollResult, setRollResult] = useState(null);

    const handleChange = (field, value) => {
        updateCrew({ ...crew, [field]: value });
    };

    const rollDice = (count) => {
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        const highest = Math.max(...rolls);
        const crits = rolls.filter(r => r === 6).length >= 2;

        let outcome = '';
        if (crits) outcome = 'CRITICAL SUCCESS';
        else if (highest === 6) outcome = 'SUCCESS';
        else if (highest >= 4) outcome = 'PARTIAL SUCCESS';
        else outcome = 'FAILURE';

        setRollResult({ rolls, highest, outcome });
        setTimeout(() => setRollResult(null), 5000);
    };

    const canEdit = userRole === 'GM' || true; // Everyone can edit crew for now

    return (
        <div className="crew-sheet">
            <header className="crew-header panel">
                <div className="crew-identity">
                    <label>Crew Name</label>
                    <input
                        type="text"
                        className="input-field crew-name-input"
                        value={crew.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={!canEdit}
                    />
                </div>
                <div className="crew-tier">
                    <label>Tier</label>
                    <input
                        type="number"
                        className="input-field stat-input"
                        value={crew.tier}
                        onChange={(e) => handleChange('tier', parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                    />
                    <label>Hold</label>
                    <select
                        className="input-field"
                        value={crew.hold}
                        onChange={(e) => handleChange('hold', e.target.value)}
                        disabled={!canEdit}
                    >
                        <option value="Weak">Weak</option>
                        <option value="Strong">Strong</option>
                    </select>
                </div>
            </header>

            <div className="crew-stats-grid">
                <div className="stat-card panel">
                    <div className="stat-header">
                        <Trophy size={20} className="icon-copper" />
                        <h3>Reputation</h3>
                    </div>
                    <div className="track-container">
                        <input
                            type="number"
                            className="input-field stat-large"
                            value={crew.reputation}
                            onChange={(e) => handleChange('reputation', parseInt(e.target.value) || 0)}
                        />
                        <span className="max-value">/ 12</span>
                    </div>
                </div>

                <div className="stat-card panel">
                    <div className="stat-header">
                        <Flame size={20} className="icon-rust" />
                        <h3>Heat</h3>
                        <button className="btn-icon" onClick={() => rollDice(1)} title="Roll Heat">
                            <Dices size={16} />
                        </button>
                    </div>
                    <div className="track-container">
                        <input
                            type="number"
                            className="input-field stat-large"
                            value={crew.heat}
                            onChange={(e) => handleChange('heat', parseInt(e.target.value) || 0)}
                        />
                        <span className="max-value">/ 9</span>
                    </div>
                </div>

                <div className="stat-card panel">
                    <div className="stat-header">
                        <Coins size={20} className="icon-amber" />
                        <h3>Coin</h3>
                    </div>
                    <div className="track-container">
                        <input
                            type="number"
                            className="input-field stat-large"
                            value={crew.coin}
                            onChange={(e) => handleChange('coin', parseInt(e.target.value) || 0)}
                        />
                        <span className="max-value">/ 4 (Vault)</span>
                    </div>
                </div>
            </div>

            {rollResult && (
                <div className="dice-overlay">
                    <div className="dice-result panel">
                        <h3>{rollResult.outcome}</h3>
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

export default Crew;
