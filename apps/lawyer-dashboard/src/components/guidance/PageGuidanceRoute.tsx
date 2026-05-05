import { matchPath, useLocation } from'react-router-dom';
import PageGuidance from'./PageGuidance';
import { getGuidanceContent, type GuidanceKey } from'./guidanceContent';
import { guidanceRoutes } from'./guidanceRoutes';

const getGuidanceKeyForPath = (pathname: string): GuidanceKey => {
 const matchedRoute = guidanceRoutes.find((route) =>
 matchPath({ path: route.pattern, end: true }, pathname)
 );

 return matchedRoute?.key ??'notFound';
};

const PageGuidanceRoute = () => {
 const { pathname } = useLocation();
 const content = getGuidanceContent(getGuidanceKeyForPath(pathname));

 return <PageGuidance content={content} className="page-guidance-route" />;
};

export default PageGuidanceRoute;
