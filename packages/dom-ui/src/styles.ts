import {css, keyframes} from '@emotion/css'

export const overlay = css(
  `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  z-index: 2147483647;
  * {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }
`,
  {label: 'uauth'},
)

export const container = css(
  `
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  position: absolute;
  @media only screen and (max-width: 416px) {
    max-width: calc(100% - 16px);
    height: 100%;
    max-height: calc(100% - 16px);
  }
`,
  {label: 'uauth'},
)

export const close = css(
  `
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  padding-top: 24px;
  padding-right: 24px;
  padding-bottom: 16px;
  padding-left: 16px;
  font-size: 24px;
  min-width: 24px;
  min-height: 24px;
  max-width: 24px;
  max-height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  background-color: #ffffff;
  box-shadow: 0 0 16px #ffffff;
  border: none;
  &:active {
    color: #666;
  }
  &:before {
    content: '\\2715';
  }
`,
  {label: 'uauth'},
)

export const header = css(
  `
  padding: 16px;
  padding-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`,
  {label: 'uauth'},
)

export const logo = css(
  `
  display: flex;
  justify-content: center;
  align-items: center;
  width: 144px;
  height: 144px;
  border-radius: 50%;
  border: 1px solid #e8e9ea;
  box-shadow: 0 0 64px #e8e9ea;

  & svg {
    width: 96px;
    height: 96px;
    /* padding-bottom: 4px; */
  }
`,
  {label: 'uauth'},
)

export const innerCircle = css(
  `
  width: 192px;
  height: 192px;
  border-radius: 50%;
  border: 1px solid #e8e9ea;
  position: absolute;
`,
  {label: 'uauth'},
)

export const middleCircle = css(
  `
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 1px solid #e8e9eabb;
  position: absolute;
`,
  {label: 'uauth'},
)

export const outerCircle = css(
  `
  width: 288px;
  height: 288px;
  border-radius: 50%;
  border: 1px solid #e8e9ea66;
  position: absolute;
`,
  {label: 'uauth'},
)

export const title = css(
  `
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-weight: 700;
  font-size: 1.2em;
  background-image: linear-gradient(#fff0, #fff, #fff);
  height: 72px;
  width: calc(100% + 64px);
`,
  {label: 'uauth'},
)

export const content = css(
  `
  padding: 0 16px;
  width: 100%;
  max-width: 375px;
  margin: auto;
  & form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  & input {
    text-align: center;
    width: 100%;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 4px;
    border: 2px solid #888;
    user-select: initial;
    &:focus {
      outline: none;
      border-color: #4b47ee;
    }
  }

  & button {
    margin-top: 8px;
    text-align: center;
    width: 100%;
    font-size: 1rem;
    font-family: inherit;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 600;
    background-color: #4b47ee;
    color: white;
    border: 1.5px solid #4b47ee;
    cursor: pointer;
    &:disabled {
      cursor: not-allowed;
      background-color: #eeeef6;
      color: #babac4;
      border: 1.5px solid #e0e2ea;
    }
  }
`,
  {label: 'uauth'},
)

export const alert = css(
  `
  width: 100%;
  text-align: center;
  border-radius: 4px;
  border: 1.5px solid #d33;
  background-color: #d333;
  color: #b33;
  padding: 8px;
  margin-top: 8px;
  font-weight: 600;
`,
  {label: 'uauth'},
)

export const footer = css(
  `
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b47ee;
  width: 100%;
  max-width: 375px;
  padding: 24px 16px;
  margin: auto;
  & > a {
    display: flex;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
  }
  & svg {
    height: 1rem;
    width: 1rem;
    margin-right: 3px;
  }
`,
  {label: 'uauth'},
)

export const hidden = css(
  `
  /* visibility: hidden; */
  display: none;
`,
  {label: 'uauth'},
)

export const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

export const loading = css(
  `
  display: inline-block;
  width: 1em;
  height: 1em;

  &:after {
    content: ' ';
    display: block;
    width: 0.75em;
    height: 0.75em;
    border-radius: 50%;
    border: 3px solid;
    border-color: currentColor currentColor currentColor transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`,
  {label: 'uauth'},
)
