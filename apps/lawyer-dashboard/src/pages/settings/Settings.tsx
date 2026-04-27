import usePageTitle from '../../hooks/usePageTitle';
import { CustomCard, Container } from'@mohamy/shared-ui';
import { useEffect } from'react';

import HeadTitle from'../../components/headTitle/HeadTitle';

import ChangePassword from'./subPagesSettings/ChangePassword';
import Subscription from'./subPagesSettings/Subscription';
import ProfileComponent from'./subPagesSettings/ProfileComponent';
import { Tab, Tabs } from'@heroui/react';
import { useAppSelector, useAppDispatch } from'../../hooks/reduxHooks';
import { useSearchParams } from'react-router-dom';
import thunkGetProfile from'../../redux/settings/thunk/thunkGetProfile';
import { AsyncState } from'../../components/ui/states/AsyncState';

const Settings = () => {
 const dispatch = useAppDispatch();
  usePageTitle('الإعدادات');
 const { user } = useAppSelector(state => state.auth);
 const { profile, loading, error } = useAppSelector(state => state.settings);

 const [searchParams, setSearchParams] = useSearchParams();

 const currentTab = searchParams.get("tab") ||"1";

 const handleTabChange = (key: React.Key) => {
 setSearchParams({ tab: String(key) });
 };

 useEffect(() => {
 dispatch(thunkGetProfile());
 }, [dispatch]);

 return (
 <section className='settings'>
 <Container>
 <HeadTitle title='الإعدادات' />
 <AsyncState 
 isLoading={loading ==='pending' || loading ==='idle'} 
 isError={loading ==='failed'} 
 errorMessage={error || undefined}
 >
 <CustomCard>
 {user && profile && (
 <Tabs disableAnimation={true} aria-label="Options" variant='underlined' color='primary'
 selectedKey={currentTab}
 onSelectionChange={handleTabChange}
 >
 <Tab key="1" title="الملف الشخصى">
 <ProfileComponent profile={profile} />
 </Tab>
 <Tab key="2" title="الامان">
 <ChangePassword />
 </Tab>
 <Tab key="3" title="الاشتراك">
 <Subscription user={user} />
 </Tab>
 </Tabs>
 )}
 </CustomCard>
 </AsyncState>
 </Container>
 </section>
 );
};

export default Settings;