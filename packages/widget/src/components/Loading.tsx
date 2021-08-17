import classNames from 'classnames';
import React from 'react';
import './Loading.css';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  icon?: boolean;
}

const Loading: React.FC<Props> = ({icon, className, ...rest}) => (
  <div className={classNames('Loading', className, {Icon: icon})} {...rest} />
);

export default Loading;
