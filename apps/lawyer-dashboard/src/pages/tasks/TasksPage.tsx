import usePageTitle from '../../hooks/usePageTitle';
import { Container } from'@mohamy/shared-ui';
import'./Calendar.css';
import { useEffect, useState } from'react';

import HeadTitle from'../../components/headTitle/HeadTitle';

import FullCalendar from"@fullcalendar/react";
import dayGridPlugin from"@fullcalendar/daygrid";
import interactionPlugin from"@fullcalendar/interaction";
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import thunkAddNewTask from'../../redux/task/thunk/thunkAddNewTask';
import { sileo } from"sileo";
import thunkGetAllTasks from'../../redux/task/thunk/thunkGetAllTasks';


type BackendTask = {
 id: string;
 title: string;
 date: string;
 time: string | null;
 notes: string | null;
 creationDate: string;
 lawyerId: string;
 isActive: boolean;
};

type CalendarEvent = {
 id: string;
 title: string;
 date: string;
};


const TasksPage = () => {
 const dispatch = useAppDispatch()
  usePageTitle('المهام');
 const { tasks } = useAppSelector((state) => state.tasks);
 const { user } = useAppSelector((state) => state.auth);

 const normalizeEvents = (tasksArray: BackendTask[]): CalendarEvent[] => {
 return tasksArray.map(task => ({
 id: task.id,
 title: task.title,
 date: task.date?.split("T")[0] // ناخد التاريخ بس
 }));
 };

 const [events, setEvents] = useState<CalendarEvent[]>([]);

 const handleDateClick = (arg: { dateStr: string; }) => {
 const title = prompt("اكتب اسم الـ Task");
 if (title) {
 const newEvent: CalendarEvent = { id: crypto.randomUUID(), title, date: arg.dateStr };
 setEvents([...events, newEvent]);
 // هنا هنستدعي API عشان نحفظه في الـ DB
 saveEventToDB(newEvent);
 }
 };

 const saveEventToDB = async (event: { title: string; date: string; }) => {
 const task = {
 title: event.title,
 Date: event.date,
 Time:"",
 Notes:"",
 };
 try {
 dispatch(thunkAddNewTask({ task })).unwrap()
 sileo.success({ title:'تم إضافة المهمة بنجاح' });
 } catch {
 sileo.error({ title:'تعذّر تنفيذ العملية. أعد المحاولة.' });
 }
 };



 useEffect(() => {
 if (user) {
 dispatch(thunkGetAllTasks({ lawyerId: user.profileId }))
 }
 }, [dispatch, user])
 // 📌 لما tasks تتغير → حدث الـ events
 useEffect(() => {
 if (tasks?.length > 0) {
 const normalized = normalizeEvents(tasks);
 setEvents(normalized);
 }
 }, [tasks]);

 return (
 <section className='calendar-page'>
 <Container>
 <HeadTitle title='التقويم' />
 <div className="calendar-box w-full">
 <FullCalendar
 plugins={[dayGridPlugin, interactionPlugin]}
 initialView="dayGridMonth"
 events={events}
 dateClick={handleDateClick}
 editable={true}

 />
 </div>
 </Container>
 </section>
 );
};

export default TasksPage;