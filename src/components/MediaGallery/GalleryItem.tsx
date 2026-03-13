import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';

import { extractedFileAtom } from '../../stores/global';
import { MediaItem } from '../../types';
import { getISODateString } from '../../utils/utils';
import * as S from './style';

interface GalleryItemProps {
  item: MediaItem;
  onClick: () => void;
  isPreview: boolean;
}

function GalleryItem({ item, onClick, isPreview }: GalleryItemProps) {
  const extractedFile = useAtomValue(extractedFileAtom);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(isPreview);

  useEffect(() => {
    if (isPreview) {
      setShouldLoad(true);
      return undefined;
    }

    const element = cardRef.current;

    if (!element) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;

        if (!entry?.isIntersecting) return;

        setShouldLoad(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '300px 0px',
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isPreview]);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    if (!shouldLoad) {
      setSrc(null);
      return undefined;
    }

    if (!extractedFile || typeof extractedFile === 'string') {
      setSrc(null);
      return undefined;
    }

    const file = extractedFile.files[item.fileName];

    if (!file) {
      setSrc(null);
      return undefined;
    }

    file.async('blob').then(blob => {
      if (!isMounted) return;

      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [extractedFile, item.fileName, shouldLoad]);

  if (isPreview) {
    let previewContent = <S.LoadingCard>Loading {item.kind}...</S.LoadingCard>;

    if (src && item.kind === 'image') {
      previewContent = <S.PreviewImage src={src} alt={item.fileName} />;
    } else if (src && item.kind === 'video') {
      previewContent = (
        <S.PreviewVideo controls src={src} title={item.fileName} />
      );
    }

    return <S.PreviewContent>{previewContent}</S.PreviewContent>;
  }

  let cardMedia = <S.LoadingCard>Preview ready on scroll</S.LoadingCard>;

  if (src && item.kind === 'image') {
    cardMedia = <S.Thumbnail src={src} alt={item.fileName} loading="lazy" />;
  } else if (src && item.kind === 'video') {
    cardMedia = (
      <S.ThumbnailVideo muted playsInline preload="metadata" src={src} />
    );
  }

  return (
    <S.Card ref={cardRef} type="button" onClick={onClick}>
      {cardMedia}
      <S.CardMeta>
        <strong>{item.author ?? 'System'}</strong>
        <span>
          {item.kind === 'image' ? 'Image' : 'Video'} -{' '}
          {getISODateString(item.date)}
        </span>
      </S.CardMeta>
    </S.Card>
  );
}

export default GalleryItem;
