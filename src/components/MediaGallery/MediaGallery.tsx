import { useEffect, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import {
  focusedMessageIndexAtom,
  isMenuOpenAtom,
  messagesAtom,
  viewerModeAtom,
} from '../../stores/global';
import { globalFilterModeAtom, limitsAtom } from '../../stores/filters';
import { MediaItem } from '../../types';
import { extractMediaItems, getISODateString } from '../../utils/utils';
import GalleryItem from './GalleryItem';
import * as S from './style';

const GALLERY_CONTEXT_BEFORE = 30;
const GALLERY_CONTEXT_AFTER = 120;

function MediaGallery() {
  const messages = useAtomValue(messagesAtom);
  const setViewerMode = useSetAtom(viewerModeAtom);
  const setFocusedMessageIndex = useSetAtom(focusedMessageIndexAtom);
  const setLimits = useSetAtom(limitsAtom);
  const setGlobalFilterMode = useSetAtom(globalFilterModeAtom);
  const setIsMenuOpen = useSetAtom(isMenuOpenAtom);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const mediaItems = useMemo(() => extractMediaItems(messages), [messages]);

  const selectedItem =
    selectedIndex === null ? null : mediaItems[selectedIndex];

  useEffect(() => {
    if (!mediaItems.length) {
      setSelectedIndex(null);
      return;
    }

    setSelectedIndex(currentIndex => {
      if (currentIndex === null) return null;
      return Math.min(currentIndex, mediaItems.length - 1);
    });
  }, [mediaItems]);

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
        return;
      }

      if (selectedIndex === null) return;

      if (e.key === 'ArrowRight') {
        setSelectedIndex(currentIndex =>
          currentIndex === null
            ? 0
            : Math.min(currentIndex + 1, mediaItems.length - 1),
        );
      }

      if (e.key === 'ArrowLeft') {
        setSelectedIndex(currentIndex =>
          currentIndex === null ? 0 : Math.max(currentIndex - 1, 0),
        );
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  }, [mediaItems.length, selectedIndex]);

  const goToMessage = (item: MediaItem) => {
    const messageNumber = item.index + 1;
    const low = Math.max(1, messageNumber - GALLERY_CONTEXT_BEFORE);
    const high = messageNumber + GALLERY_CONTEXT_AFTER;

    setGlobalFilterMode('index');
    setLimits({ low, high });
    setFocusedMessageIndex(item.index);
    setViewerMode('chat');
    setSelectedIndex(null);
    setIsMenuOpen(false);
  };

  if (!mediaItems.length) {
    return (
      <S.Container>
        <S.EmptyState>
          <S.EmptyCard>
            <h2>No media found</h2>
            <p>
              This view shows image and video attachments from the full chat
              export, independent of the current message range filter.
            </p>
            <S.EmptyButton type="button" onClick={() => setViewerMode('chat')}>
              Back to chat
            </S.EmptyButton>
          </S.EmptyCard>
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.ContentColumn>
        <S.Header>
          <div>
            <S.Title>Media</S.Title>
            <S.Subtitle>
              {mediaItems.length.toLocaleString('de-CH')} media item
              {mediaItems.length === 1 ? '' : 's'} in this chat
            </S.Subtitle>
          </div>
          <S.BackButton type="button" onClick={() => setViewerMode('chat')}>
            Back to chat
          </S.BackButton>
        </S.Header>

        <S.Grid>
          {mediaItems.map((item, index) => (
            <GalleryItem
              key={`${item.index}-${item.fileName}`}
              item={item}
              isPreview={false}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </S.Grid>
      </S.ContentColumn>

      {selectedItem && (
        <S.Lightbox>
          <S.LightboxBackdrop
            type="button"
            aria-label="Close media preview"
            onClick={() => setSelectedIndex(null)}
          />
          <S.LightboxPanel>
            <S.LightboxTopbar>
              <div>
                <S.LightboxTitle>{selectedItem.fileName}</S.LightboxTitle>
                <S.LightboxMeta>
                  {selectedItem.author ?? 'System'} -{' '}
                  {getISODateString(selectedItem.date)}
                </S.LightboxMeta>
              </div>
              <S.LightboxActions>
                <S.ActionButton
                  type="button"
                  onClick={() => goToMessage(selectedItem)}
                >
                  Go to message
                </S.ActionButton>
                <S.ActionButton
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                >
                  Close
                </S.ActionButton>
              </S.LightboxActions>
            </S.LightboxTopbar>

            <S.LightboxBody>
              <S.NavButton
                type="button"
                onClick={() =>
                  setSelectedIndex(currentIndex =>
                    currentIndex === null ? 0 : Math.max(currentIndex - 1, 0),
                  )
                }
                disabled={selectedIndex === 0}
              >
                Prev
              </S.NavButton>
              <S.PreviewCard>
                <GalleryItem
                  item={selectedItem}
                  isPreview
                  onClick={() => undefined}
                />
              </S.PreviewCard>
              <S.NavButton
                type="button"
                onClick={() =>
                  setSelectedIndex(currentIndex =>
                    currentIndex === null
                      ? mediaItems.length - 1
                      : Math.min(currentIndex + 1, mediaItems.length - 1),
                  )
                }
                disabled={selectedIndex === mediaItems.length - 1}
              >
                Next
              </S.NavButton>
            </S.LightboxBody>
          </S.LightboxPanel>
        </S.Lightbox>
      )}
    </S.Container>
  );
}

export default MediaGallery;
