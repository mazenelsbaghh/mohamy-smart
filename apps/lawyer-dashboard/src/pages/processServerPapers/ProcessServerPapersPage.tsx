import { Container } from'@mohamy/shared-ui';

import HeadTitle from'../../components/headTitle/HeadTitle';
import ProcessServerPapersList from'./ProcessServerPapersList';

const ProcessServerPapersPage = () => {
 return (
 <section className="process-server-papers-page">
 <Container>
 <HeadTitle title="أوراق المحضرين" />
 <ProcessServerPapersList />
 </Container>
 </section>
 );
};

export default ProcessServerPapersPage;
