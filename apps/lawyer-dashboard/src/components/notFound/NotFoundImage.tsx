import'./NotFound.css';
import { TbFolderOff } from'react-icons/tb';
import { GoLaw } from'react-icons/go';
import { FiFileText, FiUsers } from'react-icons/fi';

type NotFoundImageProps = {
 text: string;
 variant?:'default' |'cases' |'clients' |'defenses';
 size?:'default' |'compact';
};

const icons = {
 default: TbFolderOff,
 cases: GoLaw,
 clients: FiUsers,
 defenses: FiFileText,
} as const;

const NotFoundImage = ({ text, variant ='default', size ='default' }: NotFoundImageProps) => {
 const Icon = icons[variant];

 return (
 <div className={`not-found-image not-found-image--${variant} not-found-image--${size} flex flex-col justify-center items-center py-8`}>
 <div className="not-found-icon-shell">
 <Icon className="not-found-icon" />
 </div>
 <p className='not-found mt-8'>{text}</p>
 </div>
 );
};

export default NotFoundImage;
