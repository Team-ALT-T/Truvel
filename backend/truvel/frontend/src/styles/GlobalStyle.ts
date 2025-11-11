import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    min-height: 100%;
    background-color: #FAF8F6;
    font-family: 'Pretendard', sans-serif;
    color: #1C1C1C;
    line-height: 1.5;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`

export default GlobalStyle
