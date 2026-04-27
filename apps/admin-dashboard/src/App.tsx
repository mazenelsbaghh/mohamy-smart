import { ErrorBoundary } from'@mohamy/shared-ui';
import AppRouter from'./router/AppRouter';

function App() {
 return (
 <ErrorBoundary>
 <AppRouter />
 </ErrorBoundary>
 );
}

export default App;
