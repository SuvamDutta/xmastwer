import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PostStyle, GeneratedPost } from './prompts';

export interface PostHistoryItem {
  id: string;
  timestamp: number;
  summary: string;
  style: PostStyle;
  generatedPost: GeneratedPost;
  postedToX: boolean;
  xUrl?: string;
}

export interface AppSettings {
  groqApiKey: string;
  twitterApiKey: string;
  twitterApiSecret: string;
  twitterAccessToken: string;
  twitterAccessTokenSecret: string;
  username: string;
  userHandle: string;
  avatarInitials: string;
  defaultStyle: PostStyle;
}

interface AppState {
  // UI State
  isGenerating: boolean;
  isPosting: boolean;
  activePanel: 'input' | 'preview' | 'history' | 'settings';
  showSettings: boolean;

  // Input State
  inputSummary: string;
  selectedStyle: PostStyle;

  isRecording: boolean;
  voiceTranscript: string;

  // Generated Content
  currentPost: GeneratedPost | null;
  editedTweets: string[];
  selectedTweetIndex: number;

  // History
  postHistory: PostHistoryItem[];

  // Settings (stored in localStorage)
  settings: AppSettings;

  // Actions
  setInputSummary: (summary: string) => void;
  setSelectedStyle: (style: PostStyle) => void;

  setIsRecording: (recording: boolean) => void;
  setVoiceTranscript: (transcript: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsPosting: (posting: boolean) => void;
  setCurrentPost: (post: GeneratedPost | null) => void;
  setEditedTweets: (tweets: string[]) => void;
  updateEditedTweet: (index: number, text: string) => void;
  setSelectedTweetIndex: (index: number) => void;
  setActivePanel: (panel: 'input' | 'preview' | 'history' | 'settings') => void;
  setShowSettings: (show: boolean) => void;
  addToHistory: (item: Omit<PostHistoryItem, 'id' | 'timestamp'>) => void;
  updateHistoryItem: (id: string, update: Partial<PostHistoryItem>) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetInput: () => void;
}

const defaultSettings: AppSettings = {
  groqApiKey: '',
  twitterApiKey: '',
  twitterApiSecret: '',
  twitterAccessToken: '',
  twitterAccessTokenSecret: '',
  defaultStyle: 'airdrop',
  username: 'Crypto Alpha',
  userHandle: '@cryptoalpha',
  avatarInitials: 'CA',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial UI State
      isGenerating: false,
      isPosting: false,
      activePanel: 'input',
      showSettings: false,

      // Initial Input State
      inputSummary: '',
      selectedStyle: 'airdrop',

      isRecording: false,
      voiceTranscript: '',

      // Initial Content
      currentPost: null,
      editedTweets: [],
      selectedTweetIndex: 0,

      // Initial History
      postHistory: [],

      // Initial Settings
      settings: defaultSettings,

      // Actions
      setInputSummary: (summary) => set({ inputSummary: summary }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),

      setIsRecording: (recording) => set({ isRecording: recording }),
      setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setIsPosting: (posting) => set({ isPosting: posting }),
      setCurrentPost: (post) => set({
        currentPost: post,
        editedTweets: post ? [...post.tweets] : [],
        selectedTweetIndex: 0,
      }),
      setEditedTweets: (tweets) => set({ editedTweets: tweets }),
      updateEditedTweet: (index, text) => {
        const tweets = [...get().editedTweets];
        tweets[index] = text;
        set({ editedTweets: tweets });
      },
      setSelectedTweetIndex: (index) => set({ selectedTweetIndex: index }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setShowSettings: (show) => set({ showSettings: show }),
      addToHistory: (item) => set(state => ({
        postHistory: [
          {
            ...item,
            id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: Date.now(),
          },
          ...state.postHistory,
        ].slice(0, 50), // Keep last 50
      })),
      updateHistoryItem: (id, update) => set(state => ({
        postHistory: state.postHistory.map(item =>
          item.id === id ? { ...item, ...update } : item
        ),
      })),
      clearHistory: () => set({ postHistory: [] }),
      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings },
      })),
      resetInput: () => set({
        inputSummary: '',
        voiceTranscript: '',
        currentPost: null,
        editedTweets: [],
        selectedTweetIndex: 0,
      }),
    }),
    {
      name: 'x-agent-storage',
      partialize: (state) => ({
        postHistory: state.postHistory,
        settings: state.settings,
        selectedStyle: state.selectedStyle,
      }),
    }
  )
);
