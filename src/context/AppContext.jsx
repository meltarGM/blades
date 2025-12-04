import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from '../services/storageService';
import { initialData } from '../services/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const saved = storageService.loadData();
        return saved || initialData;
    });

    const [userRole, setUserRole] = useState('GM'); // Default to GM for now, or 'GM', 'char_1', 'char_2'

    useEffect(() => {
        storageService.saveData(data);
    }, [data]);

    const updateJournal = (newJournal) => {
        setData(prev => ({ ...prev, journal: newJournal }));
    };

    const updateCrew = (newCrew) => {
        setData(prev => ({ ...prev, crew: newCrew }));
    };

    const updateCharacter = (charId, updates) => {
        setData(prev => ({
            ...prev,
            characters: prev.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
        }));
    };

    const addJournalEntry = (entry) => {
        setData(prev => ({
            ...prev,
            journal: [entry, ...prev.journal]
        }));
    };
    
	const updateJournalEntry = (updatedEntry) => {
        setData(prev => ({
            ...prev,
            // 💡 CORRECCIÓN CLAVE: Usar la coerción de tipos (ej: String()) para asegurar que la comparación funcione
            journal: prev.journal.map(entry => {
                // Comparamos forzando ambos a string para evitar fallos de tipo (Number vs String)
                if (String(entry.id) === String(updatedEntry.id)) {
                    return updatedEntry;
                }
                return entry;
            })
        }));
    };
	
	const deleteJournalEntry = (entryId) => {
        setData(prev => ({
            ...prev,
            // Filtra el array, manteniendo solo las entradas cuyo ID no coincida.
            // Usamos String() para asegurar la compatibilidad de tipos en la comparación.
            journal: prev.journal.filter(entry => 
                String(entry.id) !== String(entryId)
            )
        }));
    };

    return (
        <AppContext.Provider value={{
            data,
            userRole,
            setUserRole,
            updateJournal,
            updateCrew,
            updateCharacter,
            addJournalEntry,
            updateJournalEntry,
			deleteJournalEntry,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};