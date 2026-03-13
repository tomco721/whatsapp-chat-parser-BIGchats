import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useDeferredValue,
  startTransition,
} from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import Credits from '../Credits/Credits';
import FilterModeSelector from '../FilterModeSelector/FilterModeSelector';
import FilterMessageLimitsForm from '../FilterMessageLimitsForm/FilterMessageLimitsForm';
import FilterMessageDatesForm from '../FilterMessageDatesForm/FilterMessageDatesForm';
import ActiveUserSelector from '../ActiveUserSelector/ActiveUserSelector';

import * as S from './style';
import {
  activeUserAtom,
  focusedMessageIndexAtom,
  isAnonymousAtom,
  isMenuOpenAtom,
  messagesDateBoundsAtom,
  messagesAtom,
  participantsAtom,
  searchQueryAtom,
  viewerModeAtom,
} from '../../stores/global';
import {
  datesAtom,
  globalFilterModeAtom,
  limitsAtom,
} from '../../stores/filters';
import { FilterMode } from '../../types';
import { getISODateString, searchMessages } from '../../utils/utils';

const SEARCH_RESULTS_LIMIT = 150;
const SEARCH_CONTEXT_BEFORE = 30;
const SEARCH_CONTEXT_AFTER = 120;

function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [viewerMode, setViewerMode] = useAtom(viewerModeAtom);
  const [isAnonymous, setIsAnonymous] = useAtom(isAnonymousAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [filterMode, setFilterMode] = useState<FilterMode>('index');
  const setGlobalFilterMode = useSetAtom(globalFilterModeAtom);
  const [limits, setLimits] = useAtom(limitsAtom);
  const messages = useAtomValue(messagesAtom);
  const setDates = useSetAtom(datesAtom);
  const setFocusedMessageIndex = useSetAtom(focusedMessageIndexAtom);
  const messagesDateBounds = useAtomValue(messagesDateBoundsAtom);
  const participants = useAtomValue(participantsAtom);
  const [activeUser, setActiveUser] = useAtom(activeUserAtom);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const searchData = useMemo(
    () => searchMessages(messages, deferredSearchQuery, SEARCH_RESULTS_LIMIT),
    [messages, deferredSearchQuery],
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const setMessageLimits = (e: React.FormEvent<HTMLFormElement>) => {
    const entries = Object.fromEntries(new FormData(e.currentTarget));

    e.preventDefault();
    setLimits({
      low: parseInt(entries.lowerLimit as string, 10),
      high: parseInt(entries.upperLimit as string, 10),
    });
    setGlobalFilterMode('index');
  };

  const setMessagesByDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDates({
      start: e.currentTarget.startDate.valueAsDate,
      end: e.currentTarget.endDate.valueAsDate,
    });
    setGlobalFilterMode('date');
  };

  const goToSearchResult = (messageIndex: number) => {
    const messageNumber = messageIndex + 1;
    const low = Math.max(1, messageNumber - SEARCH_CONTEXT_BEFORE);
    const high = messageNumber + SEARCH_CONTEXT_AFTER;

    setFilterMode('index');
    setGlobalFilterMode('index');
    setLimits({ low, high });
    setFocusedMessageIndex(messageIndex);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  }, [setIsMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) closeButtonRef.current?.focus();
    else openButtonRef.current?.focus();
  }, [isMenuOpen]);

  return (
    <>
      <S.MenuOpenButton
        className="menu-open-button"
        type="button"
        onClick={() => setIsMenuOpen(true)}
        ref={openButtonRef}
      >
        Open menu
      </S.MenuOpenButton>
      <S.Overlay
        type="button"
        $isActive={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
        tabIndex={-1}
      />
      <S.Sidebar $isOpen={isMenuOpen}>
        <S.MenuCloseButton
          type="button"
          onClick={() => setIsMenuOpen(false)}
          ref={closeButtonRef}
        >
          Close menu
        </S.MenuCloseButton>
        <S.SidebarContainer>
          <S.SidebarChildren>
            <S.Fieldset>
              <legend>View</legend>
              <S.ViewSwitcher>
                <S.ViewButton
                  type="button"
                  $isActive={viewerMode === 'chat'}
                  onClick={() => setViewerMode('chat')}
                >
                  Chat
                </S.ViewButton>
                <S.ViewButton
                  type="button"
                  $isActive={viewerMode === 'media'}
                  onClick={() => setViewerMode('media')}
                >
                  Media
                </S.ViewButton>
              </S.ViewSwitcher>
            </S.Fieldset>
            <FilterModeSelector
              filterMode={filterMode}
              setFilterMode={setFilterMode}
            />
            {filterMode === 'index' && (
              <FilterMessageLimitsForm
                limits={limits}
                setMessageLimits={setMessageLimits}
              />
            )}
            {filterMode === 'date' && (
              <FilterMessageDatesForm
                messagesDateBounds={messagesDateBounds}
                setMessagesByDate={setMessagesByDate}
              />
            )}

            <S.Fieldset>
              <legend>Search chat</legend>
              <S.Field>
                <S.Label htmlFor="search-chat">Search expression</S.Label>
                <S.Input
                  id="search-chat"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type text to search in all messages"
                />
              </S.Field>

              {deferredSearchQuery.trim() && (
                <S.Field>
                  <S.InputDescription>
                    Found {searchData.total.toLocaleString('de-CH')} matches
                    {searchData.total > searchData.results.length &&
                      `, showing first ${searchData.results.length}`}
                  </S.InputDescription>
                  {searchData.results.length === 0 && (
                    <S.InputDescription>No matches found.</S.InputDescription>
                  )}
                  {searchData.results.length > 0 && (
                    <S.SearchResults>
                      {searchData.results.map(result => (
                        <li
                          key={`${result.index}-${result.date.toISOString()}`}
                        >
                          <S.SearchResultButton
                            type="button"
                            onClick={() => goToSearchResult(result.index)}
                          >
                            <S.SearchResultMeta>
                              #{(result.index + 1).toLocaleString('de-CH')} ·{' '}
                              {result.author ?? 'System'} ·{' '}
                              {getISODateString(result.date)}
                            </S.SearchResultMeta>
                            <span>{result.excerpt}</span>
                          </S.SearchResultButton>
                        </li>
                      ))}
                    </S.SearchResults>
                  )}
                </S.Field>
              )}
            </S.Fieldset>

            <ActiveUserSelector
              participants={participants}
              activeUser={activeUser}
              setActiveUser={setActiveUser}
            />

            <S.Field>
              <S.Label htmlFor="is-anonymous">Anonymize users</S.Label>
              <S.ToggleCheckbox
                id="is-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={() =>
                  startTransition(() => setIsAnonymous(bool => !bool))
                }
              />
            </S.Field>
          </S.SidebarChildren>
          <Credits />
        </S.SidebarContainer>
      </S.Sidebar>
    </>
  );
}

export default Sidebar;
