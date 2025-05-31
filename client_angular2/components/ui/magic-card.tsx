'use client';

import { cn } from '@/lib/utils';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import React, { MouseEvent, ReactElement } from 'react';

export interface MagicCardProps {
  /**
   * @default <div />
   * @type React.ElementType
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
   * @default ""
   * @type string
   * @description
   * The className of the card body
   */
  childrenClassName?: string;

  /**
   * @default 600
   * @type number
   * @description
   * The size of the spotlight effect in pixels
   * */
  size?: number;

  /**
   * @default true
   * @type boolean
   * @description
   * Whether to isolate the card which is being hovered
   * */
  isolate?: boolean;

  /**
   * @default true
   * @type boolean
   * @description
   * Whether to disable the spotlight on mobile
   * */
  disableOnMobile?: boolean;

  /**
   * @default "rgba(255,255,255,0.03)"
   * @type string
   * @description
   * Color of the spotlight
   * */
  spotlightColor?: string;

  /**
   * @required
   * @type ReactNode
   * @description
   * The content to be displayed
   * */
  children: React.ReactNode;
}

export function MagicCard({
  children,
  className,
  childrenClassName,
  size = 600,
  isolate = true,
  disableOnMobile = true,
  spotlightColor = 'rgba(255,255,255,0.03)',
  as: Component = 'div',
  ...props
}: MagicCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(${size}px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <motion.div
      className={cn(
        'group relative flex size-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border text-black dark:text-white',
        className,
      )}
      onMouseMove={handleMouseMove}
      style={{
        ...(isolate && { isolation: 'isolate' }),
      }}
      {...props}
    >
      <div className={cn('relative z-10', childrenClassName)}>{children}</div>
      <motion.div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100',
          disableOnMobile && 'group-hover:md:opacity-100',
        )}
        style={{
          background: spotlightColor,
          ...style,
        }}
      />
    </motion.div>
  );
}
