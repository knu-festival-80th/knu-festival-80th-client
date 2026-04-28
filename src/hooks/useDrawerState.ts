import { useState } from 'react';

export const useDrawerState = (initialActiveSection: string) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([initialActiveSection]));
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
