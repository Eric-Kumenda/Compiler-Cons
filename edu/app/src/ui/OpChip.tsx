import React from 'react';
import { Chip } from '@heroui/react';
import type { QuadCategory } from '../data/quads';

interface OpChipProps {
  category: QuadCategory;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const categoryColors: Record<string, "success" | "accent" | "warning" | "default" | "danger"> = {
  arith: "success",
  assign: "accent",
  compare: "warning",
  control: "default",
  label: "default",
  ret: "danger",
  decl: "accent",
};

export const OpChip: React.FC<OpChipProps> = ({ category, children, variant = "soft", size = "md", className = "" }) => {
  return (
    <Chip 
      color={categoryColors[category]} 
      variant={variant as any} 
      size={size}
      className={`font-mono font-bold ${className}`}
    >
      <Chip.Label>{children}</Chip.Label>
    </Chip>
  );
};
