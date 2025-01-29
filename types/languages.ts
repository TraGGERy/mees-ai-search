export interface Language {
  code: string;
  name: string;
  flag: string;
  native: string;
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    native: 'English'
  },
  {
    code: 'sn',
    name: 'Shona',
    flag: '🇿🇼',
    native: 'chiShona'
  },
  {
    code: 'nd',
    name: 'Ndebele',
    flag: '🇿🇼',
    native: 'isiNdebele'
  },
  {
    code: 'sw',
    name: 'Swahili',
    flag: '🇹🇿',
    native: 'Kiswahili'
  },
  {
    code: 'zu',
    name: 'Zulu',
    flag: '🇿🇦',
    native: 'isiZulu'
  },
  {
    code: 'ny',
    name: 'Nyanja',
    flag: '🇲🇼',
    native: 'Chichewa'
  },
  {
    code: 'ko',
    name: 'Korean',
    flag: '🇰🇷',
    native: '한국어'
  }
]; 