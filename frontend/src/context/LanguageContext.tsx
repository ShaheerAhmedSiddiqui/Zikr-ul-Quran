import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
    selectedLanguage: string;
    setSelectedLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedLanguage, setSelectedLanguageState] = useState('arabic');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            setSelectedLanguageState(savedLanguage);
        }
    }, []);

    const setSelectedLanguage = (language: string) => {
        setSelectedLanguageState(language);
        localStorage.setItem('selectedLanguage', language);
        console.log('🌐 Language changed to:', language);
    };

    return (
        <LanguageContext.Provider value={{
            selectedLanguage,
            setSelectedLanguage
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};