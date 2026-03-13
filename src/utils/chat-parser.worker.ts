import { parseString } from 'whatsapp-chat-parser';

import type { IndexedMessage } from '../types';

interface ParsePayload {
  text: string;
  isAnonymous: boolean;
  parseAttachments: boolean;
}

interface ParseResult {
  messages: IndexedMessage[];
}

type WorkerScope = {
  onmessage: ((event: MessageEvent<ParsePayload>) => void) | null;
  postMessage: (result: ParseResult) => void;
};

class UniqueIdGenerator {
  private cache = new Map<string, number>();

  private currentNumber = 0;

  public getId(str: string): number {
    const cachedNumber = this.cache.get(str);

    if (typeof cachedNumber !== 'undefined') return cachedNumber;

    const { currentNumber } = this;
    this.cache.set(str, currentNumber);
    this.currentNumber += 1;
    return currentNumber;
  }
}

const replaceEncryptionMessageAuthor = (messages: IndexedMessage[]) =>
  messages.map((message, i) => {
    if (i < 10 && message.message.includes('end-to-end')) {
      return { ...message, author: null };
    }

    return message;
  });

const workerScope = globalThis as unknown as WorkerScope;

workerScope.onmessage = (event: MessageEvent<ParsePayload>) => {
  const { text, isAnonymous, parseAttachments } = event.data;
  const uniqueIdGenerator = new UniqueIdGenerator();

  const parsed = parseString(text, { parseAttachments }).map(
    ({ author, ...msg }, index) => ({
      ...msg,
      author:
        author && isAnonymous
          ? `User ${uniqueIdGenerator.getId(author)}`
          : author,
      index,
    }),
  );

  const result: ParseResult = {
    messages: replaceEncryptionMessageAuthor(parsed),
  };

  workerScope.postMessage(result);
};
