import type { ReactElement } from'react';
import'./Lists.css';
import { ScrollShadow } from'@heroui/react';

const CustomList = ({ children }: { children: ReactElement<HTMLUListElement> }) => {
 return (
 <div className='custom-list'>
 <ScrollShadow>
 {children}
 </ScrollShadow>
 </div>
 );
};

export default CustomList;