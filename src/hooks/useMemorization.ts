import { useState, useEffect } from "react";

export interface MemoryItem {
  id: string;
  content: string;
  type: "preference" | "fact" | "context";
  importance: number; // 1-10, higher = more important
  timestamp: Date;
  tags: string[];
}

export function useMemorization() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Load memories from localStorage on mount
  useEffect(() => {
    const savedMemories = localStorage.getItem("gemini-memories");
    if (savedMemories) {
      const parsedMemories = JSON.parse(savedMemories).map((memory: any) => ({
        ...memory,
        timestamp: new Date(memory.timestamp),
      }));
      setMemories(parsedMemories);
    }
  }, []);

  // Save memories to localStorage
  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem("gemini-memories", JSON.stringify(memories));
    }
  }, [memories]);

  const addMemory = (memory: Omit<MemoryItem, "id" | "timestamp">) => {
    const newMemory: MemoryItem = {
      ...memory,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setMemories(prev => {
      // Check for duplicates
      const isDuplicate = prev.some(m => m.content.toLowerCase().includes(memory.content.toLowerCase()) || memory.content.toLowerCase().includes(m.content.toLowerCase()));

      if (isDuplicate) return prev;

      // Add new memory and keep only the most important ones (max 50)
      const updated = [newMemory, ...prev].sort((a, b) => b.importance - a.importance).slice(0, 50);

      return updated;
    });
  };

  const getRelevantMemories = (query: string, maxResults = 5): MemoryItem[] => {
    const queryLower = query.toLowerCase();

    return memories
      .filter(memory => {
        // Check if memory is relevant to the query
        const contentMatch = memory.content.toLowerCase().includes(queryLower);
        const tagMatch = memory.tags.some(tag => tag.toLowerCase().includes(queryLower));
        return contentMatch || tagMatch;
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxResults);
  };

  const getMemoryContext = (): string => {
    // Get the most important memories for context
    const importantMemories = memories.sort((a, b) => b.importance - a.importance).slice(0, 10);

    if (importantMemories.length === 0) return "";

    return `

IMPORTANT CONTEXT FROM PREVIOUS CONVERSATIONS:
${importantMemories.map(memory => `- ${memory.content}`).join("\n")}

Remember to use this context appropriately in your responses.`;
  };

  const clearMemories = () => {
    setMemories([]);
    localStorage.removeItem("gemini-memories");
  };

  return {
    memories,
    addMemory,
    getRelevantMemories,
    getMemoryContext,
    clearMemories,
  };
}
