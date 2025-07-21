export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: ChatFile[];
  isStreaming?: boolean;
  imageUrl?: string; // For generated images
}

export interface ChatFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded data
  mimeType: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatError {
  message: string;
  type: 'api' | 'network' | 'validation' | 'file';
  timestamp: Date;
}