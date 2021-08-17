import classNames from 'classnames';
import React from 'react';
import './UnstoppableLogo.css';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  icon?: boolean;
  dark?: boolean;
  disabled?: boolean;
  className?: string;
  svgProps?: React.SVGProps<SVGSVGElement>;
}

const UnstoppableLogo: React.FC<Props> = ({
  icon,
  dark,
  disabled,
  className,
  svgProps,
  ...rest
}) => (
  <div
    className={classNames('UnstoppableLogo', {Icon: icon}, className)}
    {...rest}
  >
    <svg {...svgProps} viewBox="0 0 52 48" fill="none" role="img">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M51.6666 1.47125V19.1724L0.333252 40.0919L51.6666 1.47125Z"
        fill={disabled ? '#ffffff' : '#2FE9FF'}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M42.0416 0.666656V31.2414C42.0416 40.1287 34.8595 47.3333 25.9999 47.3333C17.1404 47.3333 9.95825 40.1287 9.95825 31.2414V18.3678L19.5833 13.0575V31.2414C19.5833 34.3519 22.097 36.8736 25.1978 36.8736C28.2987 36.8736 30.8124 34.3519 30.8124 31.2414V6.86206L42.0416 0.666656Z"
        fill={disabled ? '#babac4' : dark ? '#ffffff' : '#4c47ee'}
      />
    </svg>
  </div>
);

export default UnstoppableLogo;
