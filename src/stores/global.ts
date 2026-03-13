import { atom } from 'jotai';
import { ViewerMode } from '../types';

import {
  extractFile,
  extractStartEndDatesFromMessages,
  messagesFromFile,
  participantsFromMessages,
} from '../utils/utils';

const isMenuOpenAtom = atom(false);
const viewerModeAtom = atom<ViewerMode>('chat');
const activeUserAtom = atom('');
const isAnonymousAtom = atom(false);
const searchQueryAtom = atom('');
const focusedMessageIndexAtom = atom<number | null>(null);
const rawFileAtom = atom<FileReader['result']>(null);
const extractedFileAtom = atom(get => extractFile(get(rawFileAtom)));
const messagesAtom = atom(get =>
  messagesFromFile(get(extractedFileAtom), get(isAnonymousAtom)),
);
const participantsAtom = atom(get =>
  participantsFromMessages(get(messagesAtom)),
);

const messagesDateBoundsAtom = atom(get =>
  extractStartEndDatesFromMessages(get(messagesAtom)),
);

export {
  isMenuOpenAtom,
  viewerModeAtom,
  activeUserAtom,
  isAnonymousAtom,
  searchQueryAtom,
  focusedMessageIndexAtom,
  rawFileAtom,
  messagesAtom,
  participantsAtom,
  extractedFileAtom,
  messagesDateBoundsAtom,
};
