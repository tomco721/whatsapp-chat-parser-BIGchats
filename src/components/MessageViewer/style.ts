import styled from 'styled-components';

import {
  whatsappThemeColor,
  viewerBackgroundColor,
  viewerDarkBackgroundColor,
} from '../../utils/colors';
import { messageBaseStyle, normalizeButton } from '../../utils/styles';

import bgImage from '../../img/bg.png';
import bgDarkImage from '../../img/bg-dark.png';

const Container = styled.div`
  flex-grow: 1;
  min-width: 0;
  padding: 0 1rem 2rem;
  background-color: ${viewerBackgroundColor};
  background-image: url(${bgImage});
  background-attachment: fixed;

  @media (min-width: 700px) {
    padding: 0 1.5rem 2rem;
  }

  @media (min-width: 1100px) {
    padding: 0 2rem 2rem;
  }

  @media (prefers-color-scheme: dark) {
    background-color: ${viewerDarkBackgroundColor};
    background-image: url(${bgDarkImage});
  }
`;

const ContentColumn = styled.div`
  width: min(100%, 1120px);
  margin-inline: auto;

  @media (min-width: 1100px) {
    width: min(100%, 1180px);
  }
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

const P = styled.p`
  text-align: center;
`;

const Info = styled.span`
  ${messageBaseStyle}

  text-align: center;
  background-color: ${whatsappThemeColor};
  color: white;
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
`;

const LoadMoreButton = styled.button`
  ${normalizeButton}

  padding: 0.75rem 1rem;
  border-radius: 999px;
  background-color: ${whatsappThemeColor};
  color: white;
`;

export {
  Container,
  ContentColumn,
  List,
  P,
  Info,
  LoadMoreWrapper,
  LoadMoreButton,
};
