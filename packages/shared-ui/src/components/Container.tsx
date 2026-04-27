import type { ReactNode } from 'react';

type TContainer = {
    children: ReactNode;
};

const Container = ({ children }: TContainer) => {
    return (
        <div className="py-4 px-4 sm:px-10 ">
            {children}
        </div>
    );
};

export default Container;