import React from 'react'
import ReactDOM from 'react-dom'
import Modal from './Modal'

export async function open(
  buildRedirectURI: (domain: string) => Promise<string>,
): Promise<string> {
  const modal = document.createElement('div')
  modal.setAttribute('id', 'modal-root')

  document.body.appendChild(modal)

  return new Promise<string>((resolve, reject) => {
    ReactDOM.render(
      <Modal
        resolve={resolve}
        reject={reject}
        buildRedirectURI={buildRedirectURI}
      />,
      modal,
    )
  }).finally(() => {
    ReactDOM.unmountComponentAtNode(modal)
    document.body.removeChild(modal)
  })
}
