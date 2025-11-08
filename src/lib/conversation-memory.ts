/**
 * Conversation Memory
 * 
 * Manages conversation history and learning from user interactions.
 * Stores preferences, topics, and conversation patterns.
 */

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  preferences: string[];
  topics: string[];
  concerns: string[];
  lastActive: number;
  conversationCount: number;
}

const STORAGE_KEY = 'hanmate-conversation-history';
const PROFILE_KEY = 'hanmate-user-profile';
const MAX_HISTORY = 20; // Keep last 20 messages for context

/**
 * Save conversation message to history
 */
export function saveMessage(message: ConversationMessage): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getConversationHistory();
    history.push(message);
    
    // Keep only recent messages
    const recentHistory = history.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentHistory));
  } catch (e) {
    console.error('Error saving message:', e);
  }
}

/**
 * Get conversation history
 */
export function getConversationHistory(): ConversationMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ConversationMessage[];
    }
  } catch (e) {
    console.error('Error reading conversation history:', e);
  }

  return [];
}

/**
 * Clear conversation history
 */
export function clearConversationHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Extract topics and concerns from conversation
 */
export function learnFromConversation(messages: ConversationMessage[]): void {
  if (typeof window === 'undefined') return;

  const profile = getUserProfile();
  
  // Extract keywords from recent messages
  const recentText = messages
    .slice(-10)
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  // Common topics for Korean elders
  const topicKeywords: Record<string, string[]> = {
    health: ['건강', '병원', '약', '아픔', '통증', '치료', 'health', 'hospital', 'medicine', 'pain'],
    family: ['가족', '자식', '손자', '딸', '아들', 'family', 'son', 'daughter', 'grandchild'],
    loneliness: ['외로움', '혼자', '고독', 'lonely', 'alone', 'loneliness'],
    money: ['돈', '경제', '생활비', '연금', 'money', 'economy', 'pension', 'expenses'],
    daily: ['일상', '하루', '요리', '산책', '독서', 'daily', 'cooking', 'walking', 'reading'],
  };

  // Detect topics mentioned
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => recentText.includes(keyword))) {
      if (!profile.topics.includes(topic)) {
        profile.topics.push(topic);
      }
    }
  }

  // Detect concerns (negative sentiment words)
  const concernKeywords = ['걱정', '불안', '힘들', '어렵', 'worried', 'anxious', 'difficult', 'hard'];
  if (concernKeywords.some(keyword => recentText.includes(keyword))) {
    // Extract the concern context
    const concernContext = messages
      .slice(-3)
      .find(m => concernKeywords.some(k => m.content.toLowerCase().includes(k)));
    if (concernContext && !profile.concerns.includes(concernContext.content.slice(0, 50))) {
      profile.concerns.push(concernContext.content.slice(0, 50));
      // Keep only last 5 concerns
      profile.concerns = profile.concerns.slice(-5);
    }
  }

  profile.lastActive = Date.now();
  profile.conversationCount += 1;

  saveUserProfile(profile);
}

/**
 * Get user profile
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      preferences: [],
      topics: [],
      concerns: [],
      lastActive: Date.now(),
      conversationCount: 0,
    };
  }

  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProfile;
    }
  } catch (e) {
    console.error('Error reading user profile:', e);
  }

  return {
    preferences: [],
    topics: [],
    concerns: [],
    lastActive: Date.now(),
    conversationCount: 0,
  };
}

/**
 * Save user profile
 */
function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}

/**
 * Get context summary for AI prompt
 */
export function getContextSummary(): string {
  const profile = getUserProfile();
  const history = getConversationHistory();

  if (history.length === 0 && profile.topics.length === 0) {
    return '';
  }

  const parts: string[] = [];

  if (profile.topics.length > 0) {
    parts.push(`User has mentioned these topics: ${profile.topics.join(', ')}`);
  }

  if (profile.concerns.length > 0) {
    parts.push(`Recent concerns: ${profile.concerns.slice(-2).join('; ')}`);
  }

  if (history.length > 0) {
    const recentMessages = history.slice(-6); // Last 6 messages for context
    parts.push(`Recent conversation context: ${recentMessages.map(m => `${m.role}: ${m.content}`).join(' | ')}`);
  }

  return parts.join('. ');
}

