import styled from 'styled-components';

import { normalizeButton, standardButton } from '../../utils/styles';
import {
  viewerBackgroundColor,
  viewerDarkBackgroundColor,
  whatsappThemeColor,
} from '../../utils/colors';

import bgImage from '../../img/bg.png';
import bgDarkImage from '../../img/bg-dark.png';

const Container = styled.div`
  min-width: 0;
  padding: 1.25rem 1rem 2rem;
  background-color: ${viewerBackgroundColor};
  background-image: url(${bgImage});
  background-attachment: fixed;

  @media (min-width: 700px) {
    padding: 1.5rem 1.5rem 2rem;
  }

  @media (min-width: 1100px) {
    padding: 1.5rem 2rem 2rem;
  }

  @media (prefers-color-scheme: dark) {
    background-color: ${viewerDarkBackgroundColor};
    background-image: url(${bgDarkImage});
  }
`;

const ContentColumn = styled.div`
  width: min(100%, 1180px);
  margin-inline: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 2rem);
`;

const Subtitle = styled.p`
  margin: 0.35rem 0 0;
  opacity: 0.75;
`;

const BackButton = styled.button`
  ${normalizeButton}
  ${standardButton}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const Card = styled.button`
  ${normalizeButton}

  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
  text-align: left;

  @media (prefers-color-scheme: dark) {
    background: rgba(38, 45, 49, 0.78);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

const Thumbnail = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.08);
`;

const ThumbnailVideo = styled.video`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.18);
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.85rem 0.9rem 1rem;
  font-size: 0.85rem;
`;

const LoadingCard = styled.div`
  display: grid;
  place-items: center;
  min-height: 180px;
  padding: 1rem;
  text-align: center;
  opacity: 0.72;
`;

const Lightbox = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
`;

const LightboxBackdrop = styled.button`
  ${normalizeButton}

  position: absolute;
  inset: 0;
  background: rgba(4, 10, 14, 0.78);
  backdrop-filter: blur(8px);
`;

const LightboxPanel = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(1200px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  margin: 1rem auto;
  padding: 1rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35);

  @media (prefers-color-scheme: dark) {
    background: rgba(24, 29, 33, 0.94);
  }
`;

const LightboxTopbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
`;

const LightboxTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
`;

const LightboxMeta = styled.div`
  margin-top: 0.35rem;
  opacity: 0.72;
  font-size: 0.9rem;
`;

const LightboxActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  ${normalizeButton}
  ${standardButton}
`;

const LightboxBody = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  min-height: 0;
  flex: 1 1 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const NavButton = styled.button`
  ${normalizeButton}

  padding: 0.9rem 1rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-weight: 700;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (prefers-color-scheme: dark) {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const PreviewCard = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;

  @media (max-width: 900px) {
    min-height: 50vh;
  }
`;

const PreviewContent = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
`;

const PreviewImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 10rem);
  object-fit: contain;
`;

const PreviewVideo = styled.video`
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 10rem);
`;

const EmptyState = styled.div`
  display: grid;
  place-items: center;
  min-height: 60vh;
`;

const EmptyCard = styled.div`
  width: min(520px, 100%);
  padding: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);

  @media (prefers-color-scheme: dark) {
    background: rgba(38, 45, 49, 0.85);
  }
`;

const EmptyButton = styled.button`
  ${normalizeButton}

  margin-top: 1rem;
  padding: 0.8rem 1.25rem;
  border-radius: 999px;
  background: ${whatsappThemeColor};
  color: #fff;
  font-weight: 700;
`;

export {
  Container,
  ContentColumn,
  Header,
  Title,
  Subtitle,
  BackButton,
  Grid,
  Card,
  Thumbnail,
  ThumbnailVideo,
  CardMeta,
  LoadingCard,
  Lightbox,
  LightboxBackdrop,
  LightboxPanel,
  LightboxTopbar,
  LightboxTitle,
  LightboxMeta,
  LightboxActions,
  ActionButton,
  LightboxBody,
  NavButton,
  PreviewCard,
  PreviewContent,
  PreviewImage,
  PreviewVideo,
  EmptyState,
  EmptyCard,
  EmptyButton,
};
