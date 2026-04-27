import { createContext, useContext } from 'react';

type SidebarContextValue = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
};

export const SidebarContext = createContext<SidebarContextValue>({
    isOpen: false,
    setIsOpen: () => {},
    toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
