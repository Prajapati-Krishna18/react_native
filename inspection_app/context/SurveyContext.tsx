import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface ContactData {
  name: string;
  phoneNumber: string;
}

export interface Survey {
  id: string;
  siteName: string;
  clientName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  photoUri: string | null;
  photoTimestamp: string | null;
  location: LocationData | null;
  contact: ContactData | null;
  notes: string;
}

export interface SurveyDraft {
  siteName: string;
  clientName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  photoUri: string | null;
  photoTimestamp: string | null;
  location: LocationData | null;
  contact: ContactData | null;
  notes: string;
}

interface SurveyContextType {
  surveys: Survey[];
  draft: SurveyDraft;
  updateDraft: (fields: Partial<SurveyDraft>) => void;
  clearDraft: () => void;
  submitSurvey: () => { success: boolean; error?: string; id?: string };
  deleteSurvey: (id: string) => Promise<void>;
  loadSurveys: () => Promise<void>;
  isLoading: boolean;
}

const initialDraft: SurveyDraft = {
  siteName: '',
  clientName: '',
  description: '',
  priority: 'Medium',
  date: new Date().toISOString().split('T')[0],
  photoUri: null,
  photoTimestamp: null,
  location: null,
  contact: null,
  notes: '',
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const SURVEYS_STORAGE_KEY = '@field_surveys_list';

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [draft, setDraft] = useState<SurveyDraft>({ ...initialDraft });
  const [isLoading, setIsLoading] = useState(true);

  // Load surveys on mount
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(SURVEYS_STORAGE_KEY);
      if (stored) {
        setSurveys(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load surveys from storage', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSurveys = async (updatedSurveys: Survey[]) => {
    try {
      await AsyncStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(updatedSurveys));
    } catch (e) {
      console.error('Failed to save surveys to storage', e);
    }
  };

  const updateDraft = (fields: Partial<SurveyDraft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  };

  const clearDraft = () => {
    setDraft({
      ...initialDraft,
      date: new Date().toISOString().split('T')[0], // Refresh date
    });
  };

  const submitSurvey = () => {
    // Validate required fields
    if (!draft.siteName.trim()) {
      return { success: false, error: 'Site Name is required' };
    }
    if (!draft.clientName.trim()) {
      return { success: false, error: 'Client Name is required' };
    }
    if (!draft.description.trim()) {
      return { success: false, error: 'Description is required' };
    }

    const newId = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newSurvey: Survey = {
      id: newId,
      ...draft,
    };

    const updated = [newSurvey, ...surveys];
    setSurveys(updated);
    saveSurveys(updated);
    clearDraft();

    return { success: true, id: newId };
  };

  const deleteSurvey = async (id: string) => {
    const updated = surveys.filter((s) => s.id !== id);
    setSurveys(updated);
    await saveSurveys(updated);
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        draft,
        updateDraft,
        clearDraft,
        submitSurvey,
        deleteSurvey,
        loadSurveys,
        isLoading,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveys = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveys must be used within a SurveyProvider');
  }
  return context;
};
