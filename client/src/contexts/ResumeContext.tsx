import React, { createContext, useContext, useReducer } from 'react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
  projects?: any[];
}

interface Resume {
  id?: string;
  title: string;
  templateId?: string;
  content: ResumeContent;
  lastScanDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ResumeState {
  currentResume: Resume | null;
  resumes: Resume[];
  selectedTemplate: any | null;
  isLoading: boolean;
}

type ResumeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_RESUME'; payload: Resume }
  | { type: 'SET_RESUMES'; payload: Resume[] }
  | { type: 'ADD_RESUME'; payload: Resume }
  | { type: 'UPDATE_RESUME'; payload: Resume }
  | { type: 'DELETE_RESUME'; payload: string }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: any }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'UPDATE_SUMMARY'; payload: string }
  | { type: 'UPDATE_EXPERIENCE'; payload: Experience[] }
  | { type: 'UPDATE_EDUCATION'; payload: Education[] }
  | { type: 'UPDATE_SKILLS'; payload: string[] }
  | { type: 'CLEAR_CURRENT_RESUME' };

const initialState: ResumeState = {
  currentResume: null,
  resumes: [],
  selectedTemplate: null,
  isLoading: false
};

const resumeReducer = (state: ResumeState, action: ResumeAction): ResumeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_RESUME':
      return { ...state, currentResume: action.payload };
    case 'SET_RESUMES':
      return { ...state, resumes: action.payload };
    case 'ADD_RESUME':
      return { ...state, resumes: [...state.resumes, action.payload] };
    case 'UPDATE_RESUME':
      return {
        ...state,
        resumes: state.resumes.map(resume =>
          resume.id === action.payload.id ? action.payload : resume
        ),
        currentResume: state.currentResume?.id === action.payload.id ? action.payload : state.currentResume
      };
    case 'DELETE_RESUME':
      return {
        ...state,
        resumes: state.resumes.filter(resume => resume.id !== action.payload),
        currentResume: state.currentResume?.id === action.payload ? null : state.currentResume
      };
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'UPDATE_PERSONAL_INFO':
      if (!state.currentResume) return state;
      return {
        ...state,
        currentResume: {
          ...state.currentResume,
          content: {
            ...state.currentResume.content,
            personalInfo: { ...state.currentResume.content.personalInfo, ...action.payload }
          }
        }
      };
    case 'UPDATE_SUMMARY':
      if (!state.currentResume) return state;
      return {
        ...state,
        currentResume: {
          ...state.currentResume,
          content: {
            ...state.currentResume.content,
            summary: action.payload
          }
        }
      };
    case 'UPDATE_EXPERIENCE':
      if (!state.currentResume) return state;
      return {
        ...state,
        currentResume: {
          ...state.currentResume,
          content: {
            ...state.currentResume.content,
            experience: action.payload
          }
        }
      };
    case 'UPDATE_EDUCATION':
      if (!state.currentResume) return state;
      return {
        ...state,
        currentResume: {
          ...state.currentResume,
          content: {
            ...state.currentResume.content,
            education: action.payload
          }
        }
      };
    case 'UPDATE_SKILLS':
      if (!state.currentResume) return state;
      return {
        ...state,
        currentResume: {
          ...state.currentResume,
          content: {
            ...state.currentResume.content,
            skills: action.payload
          }
        }
      };
    case 'CLEAR_CURRENT_RESUME':
      return { ...state, currentResume: null };
    default:
      return state;
  }
};

interface ResumeContextType {
  state: ResumeState;
  dispatch: React.Dispatch<ResumeAction>;
  createNewResume: (title: string, templateId?: string) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateExperience: (experience: Experience[]) => void;
  updateEducation: (education: Education[]) => void;
  updateSkills: (skills: string[]) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  const createNewResume = (title: string, templateId?: string) => {
    const newResume: Resume = {
      title,
      templateId,
      content: {
        personalInfo: {
          name: '',
          email: '',
          phone: '',
          location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: []
      }
    };
    dispatch({ type: 'SET_CURRENT_RESUME', payload: newResume });
  };

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: info });
  };

  const updateSummary = (summary: string) => {
    dispatch({ type: 'UPDATE_SUMMARY', payload: summary });
  };

  const updateExperience = (experience: Experience[]) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', payload: experience });
  };

  const updateEducation = (education: Education[]) => {
    dispatch({ type: 'UPDATE_EDUCATION', payload: education });
  };

  const updateSkills = (skills: string[]) => {
    dispatch({ type: 'UPDATE_SKILLS', payload: skills });
  };

  const value: ResumeContextType = {
    state,
    dispatch,
    createNewResume,
    updatePersonalInfo,
    updateSummary,
    updateExperience,
    updateEducation,
    updateSkills
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

export type { Resume, ResumeContent, PersonalInfo, Experience, Education };