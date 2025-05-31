import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface NeonGradientCardProps {
  /**
   * @default <div />
   * @type ReactElement
   * @description
   * The component to be rendered as the card
   * */
  as?: React.ElementType;

  /**
   * @default ""
   * @type string
   * @description
   * The className of the card
   */
  className?: string;

  /**
   * @required
   * @type ReactNode
   * @description
   * The content to be displayed
   * */
  children: ReactNode;

  /**
   * @default 5
   * @type number
   * @description
   * The size of the border in pixels
   * */
  borderSize?: number;

  /**
   * @default 20
   * @type number
   * @description
   * The size of the radius in pixels
   * */
  borderRadius?: number;

  /**
   * @default "from-blue-500 to-teal-500"
   * @type string
   * @description
   * The neon colors to be displayed
   * */
  neonColors?: string;

  [key: string]: any;
}

export const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = "",
  as: Component = "div",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "relative z-10 h-fit w-fit rounded-[20px] p-[2px]",
        className,
      )}
      style={
        {
          "--border-size": `${borderSize}px`,
          "--border-radius": `${borderRadius}px`,
          "--neon-first-color": "rgb(255, 20, 147)",
          "--neon-second-color": "rgb(255, 105, 180)",
          "--card-content-radius": `calc(var(--border-radius) - var(--border-size))`,
          background: `
            linear-gradient(90deg, var(--neon-first-color), var(--neon-second-color)),
            linear-gradient(90deg, var(--neon-first-color), var(--neon-second-color))
          `,
          backgroundSize: "400% 400%",
          animation: "neon-gradient 6s ease infinite",
          borderRadius: `var(--border-radius)`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className="relative z-20 h-full w-full overflow-hidden rounded-[var(--card-content-radius)] bg-gray-100 p-3 dark:bg-gray-900"
        style={{
          borderRadius: `var(--card-content-radius)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};
