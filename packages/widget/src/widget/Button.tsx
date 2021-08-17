interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  className?: never
}

const Button: React.FC<Props> = props => {
  return (
    <button {...props} className="Button">
      <img
        src="https://raw.githubusercontent.com/unstoppabledomains/unstoppable-domains-website/5531cc2485b479c64a6ed7c5365da38d28e3fc50/backend/lib/helpers/p2p-templates/templates/nft-collection/template-build/static/media/UnstoppableLogo.49845d4b.svg?token=AFBIY2LIUMHOXBHJD2VBUS3BCFDGM"
        alt=""
      />
      <span>Connect with Unstoppable</span>
    </button>
  )
}

export default Button
