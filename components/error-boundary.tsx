'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: Props) {
  return (
    <div>
      {children}
    </div>
  );
} 