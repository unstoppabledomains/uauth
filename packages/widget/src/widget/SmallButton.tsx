interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  className?: never
}

const SmallButton: React.FC<Props> = props => {
  return (
    <button {...props} className="Button Small">
      <img
        src="https://raw.githubusercontent.com/unstoppabledomains/unstoppable-domains-website/d56beea6089d57167254a600186563036d09c844/backend/lib/helpers/p2p-templates/templates/nft-collection/template-build/logo512.png?token=AFBIY2MT6XHAXQDFMEDXRYDBAGDQM"
        alt=""
      />
      <span>Login</span>
    </button>
  )
}

export default SmallButton
