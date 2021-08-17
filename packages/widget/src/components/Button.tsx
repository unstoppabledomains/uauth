import classNames from 'classnames';
import React from 'react';
import './Button.css';

export interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  icon?: React.ReactElement;
}

const Button: React.FC<Props> = ({className, icon, children, ...rest}) => (
  <button className={classNames(' Button', className)} {...rest}>
    {icon}
    {children}
  </button>
);

export default Button;
