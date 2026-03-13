import JSZip from 'jszip';
import { parseString } from 'whatsapp-chat-parser';
import {
  DateBounds,
  ExtractedFile,
  FilterMode,
  IndexedMessage,
  ILimits,
  MediaItem,
  SearchMessagesOutput,
} from '../types';
import { UniqueIdGenerator } from './unique-id-generator';

const getMimeType = (fileName: string) => {
  if (/\.jpe?g$/.test(fileName)) return 'image/jpeg';
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.gif')) return 'image/gif';
  if (fileName.endsWith('.webp')) return 'image/webp';
  if (fileName.endsWith('.svg')) return 'image/svg+xml';

  if (fileName.endsWith('.mp4')) return 'video/mp4';
  if (fileName.endsWith('.webm')) return 'video/webm';

  if (fileName.endsWith('.mp3')) return 'audio/mpeg';
  if (fileName.endsWith('.m4a')) return 'audio/mp4';
  if (fileName.endsWith('.wav')) return 'audio/wav';
  if (fileName.endsWith('.opus')) return 'audio/ogg';

  return null;
};

const showError = (message: string, err?: Error) => {
  console.error(err || message); // eslint-disable-line no-console
  alert(message); // eslint-disable-line no-alert
};

const readChatFile = (zipData: JSZip) => {
  const chatFile = zipData.file('_chat.txt');

  if (chatFile) return chatFile.async('string');

  const chatFiles = zipData.file(/.*(?:chat|whatsapp).*\.txt$/i);

  if (!chatFiles.length) {
    return Promise.reject(new Error('No txt files found in archive'));
  }

  const chatFilesSorted = chatFiles.sort(
    (a, b) => a.name.length - b.name.length,
  );

  return chatFilesSorted[0].async('string');
};

const replaceEncryptionMessageAuthor = (messages: IndexedMessage[]) =>
  messages.map((message, i) => {
    if (i < 10 && message.message.includes('end-to-end')) {
      return { ...message, author: null };
    }
    return message;
  });

const extractFile = (file: FileReader['result']) => {
  if (!file) return null;
  if (typeof file === 'string') return file;

  const jszip = new JSZip();

  return jszip.loadAsync(file);
};

const fileToText = (file: ExtractedFile) => {
  if (!file) return Promise.resolve('');
  if (typeof file === 'string') return Promise.resolve(file);

  return readChatFile(file).catch((err: Error) => {
    // eslint-disable-next-line no-alert
    alert(err);
    return Promise.resolve('');
  });
};

function messagesFromFile(file: ExtractedFile, isAnonymous = false) {
  const parseInMainThread = (text: string) => {
    const uniqueIdGenerator = new UniqueIdGenerator();
    const parsed = parseString(text, {
      parseAttachments: file instanceof JSZip,
    }).map(({ author, ...msg }, index) => ({
      ...msg,
      author:
        author && isAnonymous
          ? `User ${uniqueIdGenerator.getId(author)}`
          : author,
      index,
    }));

    return replaceEncryptionMessageAuthor(parsed);
  };

  const parseInWorker = (text: string): Promise<IndexedMessage[]> =>
    new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL('./chat-parser.worker.ts', import.meta.url),
        { type: 'module' },
      );

      worker.onmessage = (
        event: MessageEvent<{ messages: IndexedMessage[] }>,
      ) => {
        resolve(event.data.messages);
        worker.terminate();
      };

      worker.onerror = err => {
        reject(err.error ?? err);
        worker.terminate();
      };

      worker.postMessage({
        text,
        isAnonymous,
        parseAttachments: file instanceof JSZip,
      });
    });

  return fileToText(file).then(async text => {
    if (!text) return [];

    try {
      // Use a worker for large files to avoid blocking the UI thread.
      if (text.length > 2_000_000) return await parseInWorker(text);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        'Worker parse failed, falling back to main thread parse.',
        err,
      );
    }

    return parseInMainThread(text);
  });
}

function participantsFromMessages(messages: IndexedMessage[]) {
  const set = new Set<string>();

  messages.forEach(m => {
    if (m.author) set.add(m.author);
  });

  return Array.from(set);
}

function getISODateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function extractStartEndDatesFromMessages(
  messages: IndexedMessage[],
): DateBounds {
  const start = messages[0]?.date ?? new Date();
  const end = messages.at(-1)?.date ?? new Date();

  return { start, end };
}

function filterMessagesByDate(
  messages: IndexedMessage[],
  startDate: Date,
  endDate: Date,
) {
  return messages.filter(
    message => message.date >= startDate && message.date <= endDate,
  );
}

function getFilteredMessages(
  messages: IndexedMessage[],
  filterMode: FilterMode,
  limits: ILimits,
  startDate: Date,
  endDate: Date,
) {
  if (filterMode === 'index') {
    return messages.slice(limits.low - 1, limits.high);
  }

  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
  return filterMessagesByDate(messages, startDate, endDatePlusOne);
}

function extractMediaItems(messages: IndexedMessage[]): MediaItem[] {
  return messages.flatMap(message => {
    const fileName = message.attachment?.fileName;

    if (!fileName) return [];

    const mimeType = getMimeType(fileName);
    let kind: MediaItem['kind'] | null = null;

    if (mimeType?.startsWith('image/')) {
      kind = 'image';
    } else if (mimeType?.startsWith('video/')) {
      kind = 'video';
    }

    if (!mimeType || !kind) return [];

    return [
      {
        index: message.index,
        fileName,
        author: message.author,
        date: message.date,
        mimeType,
        kind,
      },
    ];
  });
}

function searchMessages(
  messages: IndexedMessage[],
  rawQuery: string,
  maxResults = 200,
): SearchMessagesOutput {
  const query = rawQuery.trim().toLowerCase();

  if (!query) return { total: 0, results: [] };

  const results: SearchMessagesOutput['results'] = [];
  let total = 0;

  messages.forEach(message => {
    const loweredMessage = message.message.toLowerCase();
    const matchPosition = loweredMessage.indexOf(query);

    if (matchPosition === -1) return;

    total += 1;
    if (results.length >= maxResults) return;

    const excerptStart = Math.max(0, matchPosition - 40);
    const excerptEnd = Math.min(
      message.message.length,
      matchPosition + query.length + 80,
    );
    const rawExcerpt = message.message
      .slice(excerptStart, excerptEnd)
      .replace(/\s+/g, ' ')
      .trim();
    const excerptPrefix = excerptStart > 0 ? '... ' : '';
    const excerptSuffix = excerptEnd < message.message.length ? ' ...' : '';

    results.push({
      index: message.index,
      author: message.author,
      date: message.date,
      excerpt: `${excerptPrefix}${rawExcerpt}${excerptSuffix}`,
    });
  });

  return { total, results };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export {
  getMimeType,
  showError,
  readChatFile,
  replaceEncryptionMessageAuthor,
  extractFile,
  fileToText,
  messagesFromFile,
  participantsFromMessages,
  getISODateString,
  extractStartEndDatesFromMessages,
  filterMessagesByDate,
  getFilteredMessages,
  searchMessages,
  extractMediaItems,
  capitalize,
};
