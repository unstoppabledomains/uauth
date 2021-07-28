import React, {useState} from 'react'
import Button from './Button'
import './index.css'
import Modal from './Modal'
import SmallButton from './SmallButton'

interface Props {
  small?: boolean
}

const Widget: React.FC<Props> = ({small = false}) => {
  const [active, setActive] = useState<boolean>(false)

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (active) {
      return
    }
    setActive(true)
  }

  const handleClose: () => void = () => {
    setActive(false)
  }

  return (
    <div className="Widget">
      {active && <Modal onClose={handleClose} />}
      {active ||
        (small ? (
          <SmallButton onClick={handleButtonClick} />
        ) : (
          <Button onClick={handleButtonClick} />
        ))}
    </div>
  )
}

export default Widget
