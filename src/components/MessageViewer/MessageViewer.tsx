import React, { useMemo, useEffect, useState } from 'react';
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
  const limits = useAtomValue(limitsAtom);
  const [activeUser, setActiveUser] = useAtom(activeUserAtom);
  const focusedMessageIndex = useAtomValue(focusedMessageIndexAtom);
  const participants = useAtomValue(participantsAtom);
  const messages = useAtomValue(messagesAtom);
  const filterMode = useAtomValue(globalFilterModeAtom);
  const { start: startDate, end: endDate } = useAtomValue(datesAtom);
  const [renderLimit, setRenderLimit] = useState(INITIAL_RENDERED_MESSAGES);
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
  const hasMoreMessages = visibleMessages.length < renderedMessages.length;

  useEffect(() => {
    setActiveUser(participants[0] || '');
  }, [setActiveUser, participants]);

  useEffect(() => {
    setRenderLimit(INITIAL_RENDERED_MESSAGES);
  }, [filterMode, limits.low, limits.high, startDateMs, endDateMs, messages]);

  useEffect(() => {
    if (focusedMessageIndex === null) return;

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
  }, [focusedMessageIndex, renderLimit, renderedMessages]);

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
        {hasMoreMessages && (
          <S.LoadMoreWrapper>
            <S.LoadMoreButton
              type="button"
              onClick={() => setRenderLimit(oldValue => oldValue + RENDER_STEP)}
            >
              Load more messages (
              {renderedMessages.length - visibleMessages.length} remaining)
            </S.LoadMoreButton>
          </S.LoadMoreWrapper>
        )}
      </S.ContentColumn>
    </S.Container>
  );
}

export default React.memo(MessageViewer);
