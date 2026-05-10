export interface NavChild {
  label: string;
  to: string;
}

export interface NavSection {
  id: string;
  label: string;
  children: NavChild[];
}

export interface NavLeaf {
  id: string;
  label: string;
  to: string;
}

export type NavItem = NavSection | NavLeaf;

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
