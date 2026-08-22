"use client";

export interface NailShapeIconProps {
  /** Nail shape type: "oval" | "almond" | "coffin" | "square" | "stiletto" */
  type: string;
  /** Whether this shape is currently selected — affects stroke & fill color */
  isSelected?: boolean;
  /** Override width (default 22) */
  width?: number;
  /** Override height (default 34) */
  height?: number;

  stroke?: number;
}

export default function NailShapeIcon({
  type,
  isSelected = false,
  width = 22,
  height = 34,
  stroke,
}: NailShapeIconProps) {
  const strokeColor = isSelected ? "#c87a8a" : "#b0967c";
  const fillColor = isSelected ? "rgba(200, 122, 138, 0.12)" : "transparent";

  const commonProps = {
    width,
    height,
    viewBox: "0 0 22 34",
    fill: "none" as const,
    className: `transition-all duration-200`,
  };

  switch (type.toLowerCase()) {
    case "oval":
      return (
        <svg {...commonProps}>
          {/* Oval: rounded curved top & smooth sides */}
          <path
            d="M 3,32 C 3,18 4,8 11,3 C 18,8 19,18 19,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill={fillColor}
          />
        </svg>
      );

    case "almond":
      return (
        <svg {...commonProps}>
          {/* Almond: tapered sides meeting at a softly pointed tip */}
          <path
            d="M 4,32 C 4,20 6,10 11,2 C 16,10 18,20 18,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill={fillColor}
          />
        </svg>
      );

    case "coffin":
      return (
        <svg {...commonProps}>
          {/* Coffin: tapered sides with a crisp flat horizontal top edge */}
          <path
            d="M 4,32 L 6.5,8 L 15.5,8 L 18,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={fillColor}
          />
        </svg>
      );

    case "square":
      return (
        <svg {...commonProps}>
          {/* Square: straight parallel sides with flat top and gentle curve */}
          <path
            d="M 4,32 L 4,7 C 4,5 5,4 7,4 L 15,4 C 17,4 18,5 18,7 L 18,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={fillColor}
          />
        </svg>
      );

    case "stiletto":
      return (
        <svg {...commonProps}>
          {/* Stiletto: sleek taper to a sharp pointed tip */}
          <path
            d="M 4,32 L 11,2 L 18,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={fillColor}
          />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <path
            d="M 4,32 C 4,16 6,6 11,3 C 16,6 18,16 18,32"
            stroke={strokeColor}
            strokeWidth={stroke}
            fill={fillColor}
          />
        </svg>
      );
  }
}
