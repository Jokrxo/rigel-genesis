import { useLocalStorage } from './useLocalStorage';

export type Language = 'en' | 'af' | 'zu';

export function useLanguage() {
  const [language, setLanguage] = useLocalStorage<Language>('app-language', 'en');

  return {
    language,
    setLanguage,
  };
}
