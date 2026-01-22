import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 50"
      width="160"
      height="30"
      {...props}
    >
      <text
        x="10"
        y="35"
        fontFamily="'Playfair Display', serif"
        fontSize="32"
        fontWeight="bold"
        fill="currentColor"
        className="text-primary"
      >
        Connect
        <tspan fill="currentColor" className="text-foreground">
          Mentor
        </tspan>
      </text>
    </svg>
  );
}
