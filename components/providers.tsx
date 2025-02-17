'use client';

import { NextIntlClientProvider } from 'next-intl';
import { PropsWithChildren } from 'react';

export function Providers({
  messages,
  locale,
  children
}: PropsWithChildren<{
  messages: any;
  locale: string;
}>) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
} 