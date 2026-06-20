import maternityCareLogo from '@/assets/brand/maternity-care-logo.svg';
import { cn } from '@/lib/cn';

interface BrandLogoProps {
  className?: string;
  decorative?: boolean;
}

export function BrandLogo({ className, decorative = true }: BrandLogoProps) {
  return (
    <img
      src={maternityCareLogo}
      alt={decorative ? '' : 'Logo MaternityCare'}
      aria-hidden={decorative}
      className={cn('block object-contain', className)}
    />
  );
}
