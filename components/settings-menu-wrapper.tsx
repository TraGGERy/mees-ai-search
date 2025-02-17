'use client'

import { useTranslations } from 'next-intl';
import { SettingsMenu } from './settings-menu';

export function SettingsMenuWrapper() {
  const t = useTranslations();
  return <SettingsMenu t={t} />;
} 