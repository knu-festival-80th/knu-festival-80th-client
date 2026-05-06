import { useState } from 'react';

export const useDrawerState = (initialOpenSections: string[]) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(initialOpenSections));
  const initialActiveSection = initialOpenSections[0] ?? '';
  const [activeSection, setActiveSection] = useState<string | null>(initialActiveSection);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveSection(id);
  };

  return { openSections, activeSection, toggleSection };
};
