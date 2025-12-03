const STORAGE_KEY = 'doskvol_campaign_data';

export const storageService = {
    loadData: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    },

    saveData: (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    },

    clearData: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
