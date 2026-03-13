import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAtom, useAtomValue } from 'jotai';

import Message from '../Message/Message';
import * as S from './style';
import {
  activeUserAtom,
  focusedMessageIndexAtom,
  messagesAtom,
  participantsAtom,
} from '../../stores/global';

import { authorColors } from '../../utils/colors';
import {
  datesAtom,
  globalFilterModeAtom,
  limitsAtom,
} from '../../stores/filters';
import { filterMessagesByDate, getISODateString } from '../../utils/utils';

const INITIAL_RENDERED_MESSAGES = 300;
const RENDER_STEP = 300;

function MessageViewer() {
  const [limits, setLimits] = useAtom(limitsAtom);
  const [activeUser, setActiveUser] = useAtom(activeUserAtom);
  const focusedMessageIndex = useAtomValue(focusedMessageIndexAtom);
  const participants = useAtomValue(participantsAtom);
  const messages = useAtomValue(messagesAtom);
  const filterMode = useAtomValue(globalFilterModeAtom);
  const { start: startDate, end: endDate } = useAtomValue(datesAtom);
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDERED_MESSAGES);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const pendingFocusedScrollRef = useRef<number | null>(null);
  const startDateMs = startDate.getTime();
  const endDateMs = endDate.getTime();
  const colorMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};

    participants.forEach((participant, i) => {
      map[participant] = authorColors[i % authorColors.length];
    });

    return map;
  }, [participants]);

  const renderedMessages = useMemo(() => {
    if (filterMode === 'index') {
      return messages.slice(limits.low - 1, limits.high);
    }

    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    return filterMessagesByDate(messages, startDate, endDatePlusOne);
  }, [filterMode, limits.high, limits.low, messages, startDate, endDate]);

  const visibleMessages = useMemo(
    () => renderedMessages.slice(0, renderLimit),
    [renderLimit, renderedMessages],
  );

  const isLimited = renderedMessages.length !== messages.length;
  const canExpandIndexWindow =
    filterMode === 'index' && limits.high < messages.length;
  const hasMoreMessages =
    visibleMessages.length < renderedMessages.length || canExpandIndexWindow;

  const loadMoreMessages = useCallback(() => {
    if (visibleMessages.length < renderedMessages.length) {
      setRenderLimit(oldValue =>
        Math.min(oldValue + RENDER_STEP, renderedMessages.length),
      );
      return;
    }

    if (!canExpandIndexWindow) return;

    setLimits({
      low: limits.low,
      high: Math.min(limits.high + RENDER_STEP, messages.length),
    });
  }, [
    canExpandIndexWindow,
    limits.high,
    limits.low,
    messages.length,
    renderedMessages.length,
    setLimits,
    visibleMessages.length,
  ]);

  useEffect(() => {
    setActiveUser(participants[0] || '');
  }, [setActiveUser, participants]);

  useEffect(() => {
    setRenderLimit(INITIAL_RENDERED_MESSAGES);
  }, [filterMode, limits.low, limits.high, startDateMs, endDateMs, messages]);

  useEffect(() => {
    pendingFocusedScrollRef.current = focusedMessageIndex;
  }, [focusedMessageIndex]);

  useEffect(() => {
    if (focusedMessageIndex === null) return;
    if (pendingFocusedScrollRef.current !== focusedMessageIndex) return;

    const targetPosition = renderedMessages.findIndex(
      message => message.index === focusedMessageIndex,
    );
    if (targetPosition === -1) return;

    if (renderLimit < targetPosition + 1) {
      setRenderLimit(targetPosition + 1);
      return;
    }

    const messageDOM = document.getElementById(
      `message-${focusedMessageIndex}`,
    );
    if (!messageDOM) return;

    messageDOM.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pendingFocusedScrollRef.current = null;
  }, [focusedMessageIndex, renderLimit, renderedMessages]);

  useEffect(() => {
    const triggerElement = loadMoreTriggerRef.current;

    if (!triggerElement || !hasMoreMessages) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;

        if (!entry?.isIntersecting) return;

        loadMoreMessages();
      },
      {
        root: null,
        rootMargin: '0px 0px 800px 0px',
      },
    );

    observer.observe(triggerElement);

    return () => observer.disconnect();
  }, [
    canExpandIndexWindow,
    hasMoreMessages,
    limits.high,
    limits.low,
    loadMoreMessages,
    messages.length,
    renderedMessages.length,
    visibleMessages.length,
  ]);

  return (
    <S.Container>
      <S.ContentColumn>
        {messages.length > 0 && (
          <S.P>
            <S.Info>
              {isLimited && filterMode === 'index' && (
                <span>
                  Showing messages {limits.low} to{' '}
                  {Math.min(limits.high, messages.length)} (
                  {visibleMessages.length} out of {messages.length})
                </span>
              )}
              {isLimited && filterMode === 'date' && (
                <span>
                  Showing messages from {getISODateString(startDate)} to{' '}
                  {getISODateString(endDate)}
                </span>
              )}
              {!isLimited && (
                <span>
                  Showing {visibleMessages.length} out of {messages.length}{' '}
                  messages
                </span>
              )}
            </S.Info>
          </S.P>
        )}

        <S.List>
          {visibleMessages.map((message, i) => {
            const prevMessage = visibleMessages[i - 1];

            return (
              <Message
                key={message.index}
                message={message}
                color={colorMap[message.author || '']}
                isActiveUser={activeUser === message.author}
                isSearchFocused={focusedMessageIndex === message.index}
                sameAuthorAsPrevious={
                  prevMessage && prevMessage.author === message.author
                }
              />
            );
          })}
        </S.List>
        {hasMoreMessages && <S.LoadMoreTrigger ref={loadMoreTriggerRef} />}
        {hasMoreMessages && (
          <S.LoadMoreWrapper>
            <S.LoadMoreButton type="button" onClick={loadMoreMessages}>
              Load more messages (
              {filterMode === 'index'
                ? messages.length - visibleMessages.length
                : renderedMessages.length - visibleMessages.length}{' '}
              remaining)
            </S.LoadMoreButton>
          </S.LoadMoreWrapper>
        )}
      </S.ContentColumn>
    </S.Container>
  );
}

export default React.memo(MessageViewer);
