import React from 'react';
import Button from './Button';
import UnstoppableLogo from './icons/UnstoppableLogo';
import Loading from './Loading';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  loading?: boolean;
}

const LoginButton: React.FC<Props> = ({loading, disabled, ...rest}) => (
  <Button
    disabled={disabled}
    icon={
      loading ? (
        <Loading icon />
      ) : (
        <UnstoppableLogo icon dark disabled={disabled} />
      )
    }
    {...rest}
    children={<span>Login with Unstoppable</span>}
  />
);

export default LoginButton;
