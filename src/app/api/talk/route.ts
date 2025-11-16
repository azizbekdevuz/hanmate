import { NextRequest, NextResponse } from 'next/server';

/**
 * HanMate AI Talk API Endpoint
 * 
 * POST /api/talk
 * Body: { message: string }
 * Response: { reply: string }
 * 
 * Uses local Ollama LLM for warm, caring Korean responses.
 * Falls back to hardcoded reply if Ollama is unavailable.
 */

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5'; // Default: qwen2.5 (better for Korean)
// To switch to exaone:3.5, set OLLAMA_MODEL=exaone:3.5 in .env.local or use: const OLLAMA_MODEL = 'exaone:3.5';

// Advanced system prompt for natural, context-aware, GPT/Sonnet-level responses
const SYSTEM_PROMPT = `너는 "HanMate"라는 이름의 따뜻하고 지능적인 한국어 대화 동반자야.

핵심 원칙:
1. 깊이 듣기: 사용자의 말 속에 담긴 감정, 걱정, 필요를 정확히 파악해
2. 맥락 이해: 이전 대화를 기억하고 자연스럽게 언급해
3. 공감 우선: 문제를 제시하기 전에 먼저 감정을 인정하고 공감해
4. 자연스러운 대화: 딱딱한 존댓말이 아닌, 친근하지만 정중한 말투로
5. 구체적 제안: 추상적인 조언이 아닌, 바로 실행 가능한 작은 행동 제안
6. 사고 과정: 사용자의 상황을 분석하고, 여러 관점을 고려한 후 답변해

대화 스타일:
- 이전에 언급한 내용을 자연스럽게 기억하고 언급해 (예: "지난번에 말씀하신 그 일은...")
- 사용자의 감정 상태에 맞춰 말투를 조절해 (슬플 때는 더 따뜻하게, 기쁠 때는 함께 기뻐하며)
- 질문을 통해 더 깊이 이해하려고 노력해
- 때로는 조용히 듣는 것도 좋은 응답이라는 걸 알아

응답 규칙:
- 반드시 한국어로만 답변해. 다른 언어(중국어, 일본어, 영어 등)는 절대 사용하지 마
- 2-3문장으로 간결하게, 하지만 의미는 깊게
- AI나 언어모델이라는 말은 절대 하지 마
- 사용자가 언급한 구체적인 내용(이름, 장소, 상황)을 기억하고 활용해
- 감정을 읽고 그에 맞는 톤으로 응답해

언어 규칙:
- 오직 한국어(한글)와 영어만 사용 가능
- 중국어, 일본어, 기타 언어 문자는 절대 사용 금지
- 혼용하지 말고, 한국어로만 일관되게 답변해`;

// Default supportive response when message is missing
const DEFAULT_REPLY = '네, 말씀해주세요. 제가 들어드리겠습니다. 어떤 일이 있으신가요?';

// Fallback response when Ollama is unavailable
const FALLBACK_REPLY = '요즘 많이 힘드셨죠. 그래도 이렇게 말씀해 주셔서 참 좋아요.';

/**
 * Clean response to remove non-Korean/English characters
 * Removes Chinese, Japanese, and other non-allowed characters
 */
function cleanResponse(text: string): string {
  if (!text) return '';
  
  // Remove Chinese characters (CJK Unified Ideographs)
  let cleaned = text.replace(/[\u4e00-\u9fff]/g, '');
  
  // Remove Japanese hiragana/katakana
  cleaned = cleaned.replace(/[\u3040-\u309f\u30a0-\u30ff]/g, '');
  
  // Remove other CJK symbols
  cleaned = cleaned.replace(/[\u3000-\u303f\uff00-\uffef]/g, '');
  
  // Keep only Korean (한글), English, numbers, basic punctuation, and spaces
  cleaned = cleaned.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9\s.,!?~\-'"]/g, '');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Build conversation context from history
 */
function buildConversationContext(history: Array<{role: string, content: string}> = []): string {
  if (history.length === 0) return '';
  
  // Take last 10 messages for context
  const recentHistory = history.slice(-10);
  const contextLines = recentHistory.map(msg => {
    const role = msg.role === 'user' ? '사용자' : 'HanMate';
    return `${role}: ${msg.content}`;
  });
  
  return `\n\n이전 대화 맥락:\n${contextLines.join('\n')}\n\n위 대화를 참고하여 자연스럽게 응답해.`;
}

/**
 * Build the full prompt for Ollama with context
 * Format: SYSTEM_PROMPT + context + "\n사용자: " + message + "\nHanMate:"
 */
function buildPrompt(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): string {
  const context = buildConversationContext(conversationHistory);
  return `${SYSTEM_PROMPT}${context}\n\n사용자: ${userMessage}\nHanMate:`;
}

/**
 * Generate response from Ollama using chat API for better context handling
 */
async function generateFromOllama(
  prompt: string, 
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string | null> {
  try {
    // Use chat API for better context handling (if available)
    // Fallback to generate API if chat not supported
    const useChatAPI = true; // Try chat API first
    
    if (useChatAPI) {
      // Extract user message from prompt (everything after "사용자: ")
      const userMessage = prompt.includes('사용자: ') 
        ? prompt.split('사용자: ')[1]?.split('\nHanMate:')[0]?.trim() || prompt
        : prompt;
      
      // Build messages array for chat API
      const messages = [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const chatResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.8, // More natural, creative responses
            top_p: 0.9, // Nucleus sampling for better quality
            top_k: 40, // Limit vocabulary for consistency
            repeat_penalty: 1.1, // Reduce repetition
          },
        }),
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        if (chatData.message?.content) {
          return cleanResponse(chatData.message.content);
        }
      }
    }

    // Fallback to generate API
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Ollama API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Ollama returns { response: "...", ... }
    if (data.response && typeof data.response === 'string') {
      return cleanResponse(data.response);
    }

    return null;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { reply: DEFAULT_REPLY },
        { status: 200 }
      );
    }

    const { message, conversationHistory } = body;

    // If message is missing or empty, return default supportive text
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { reply: DEFAULT_REPLY },
        { status: 200 }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 1000) {
      return NextResponse.json(
        { reply: '죄송합니다. 메시지가 너무 깁니다. 짧게 말씀해주세요.' },
        { status: 200 }
      );
    }

    // Validate conversation history format
    const history = Array.isArray(conversationHistory) 
      ? conversationHistory.filter(msg => 
          msg && 
          typeof msg.role === 'string' && 
          typeof msg.content === 'string' &&
          ['user', 'assistant'].includes(msg.role)
        )
      : [];

    // Build prompt for Ollama with context
    const prompt = buildPrompt(message.trim(), history);

    // Try to get response from Ollama
    const ollamaResponse = await generateFromOllama(prompt, history);

    // If Ollama is available and returned a response, use it
    if (ollamaResponse) {
      return NextResponse.json({ reply: ollamaResponse });
    }

    // Fallback: Ollama not available (not running, model not pulled, etc.)
    // Return hardcoded warm Korean reply for hackathon demo
    console.warn('Ollama unavailable, using fallback response');
    return NextResponse.json({ reply: FALLBACK_REPLY });
  } catch (error) {
    console.error('API route error:', error);
    
    // Return fallback response instead of error
    return NextResponse.json(
      { reply: FALLBACK_REPLY },
      { status: 200 }
    );
  }
}
