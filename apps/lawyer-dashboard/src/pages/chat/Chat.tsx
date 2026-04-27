import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, Container } from'@mohamy/shared-ui';
import'./Chat.css';
import { useState, useRef, useEffect } from'react';

import HeadTitle from'../../components/headTitle/HeadTitle';


import { Avatar, Textarea } from'@heroui/react';

import { VscSend } from'react-icons/vsc';
import { IoChatbubbleEllipsesOutline, IoSparklesOutline } from'react-icons/io5';
import { LuChevronDown, LuScale, LuWandSparkles } from'react-icons/lu';

import { chatFormSchema, type chatFormType } from'../../validations/chatFormSchema';
import { useForm, type SubmitHandler } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';

import { motion, AnimatePresence } from'framer-motion';
import api from'../../APIs/api';
import { API_ROUTES } from'../../APIs/routes';
import { sileo } from"sileo";

interface ChatMessage {
 role:'user' |'assistant';
 content: string;
}

type ChatSection = {
 reasoning: string | null;
 response: string;
};

const REASONING_SECTION_PATTERN = /(التحليل القانوني|التحليل|التسبيب|أسباب الرد|خطوات التحليل|منهج الإجابة|reasoning|analysis)\s*[:：-]/i;

const sanitizeDisplayContent = (content: string) => {
 return content
 .replace(/\*\*/g,'')
 .replace(/__/g,'')
 .replace(/`/g,'')
 .replace(/^#{1,6}\s*/gm,'')
 .trim();
};

const parseAssistantContent = (content: string): ChatSection => {
 const normalized = sanitizeDisplayContent(content);
 if (!normalized) {
 return { reasoning: null, response:'' };
 }

 const match = normalized.match(REASONING_SECTION_PATTERN);
 if (!match || match.index === undefined) {
 return { reasoning: null, response: normalized };
 }

 const reasoningStart = match.index;
 const afterHeading = reasoningStart + match[0].length;
 const remaining = normalized.slice(afterHeading).trim();
 const sections = remaining.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

 if (sections.length < 2) {
 return { reasoning: null, response: normalized };
 }

 const reasoning = sections.shift() ?? null;
 const response = sections.join('\n\n').trim();

 if (!reasoning || !response) {
 return { reasoning: null, response: normalized };
 }

 return { reasoning, response };
};

const renderParagraphs = (content: string) => {
 return content
 .split(/\n{2,}/)
 .map((paragraph) => paragraph.trim())
 .filter(Boolean)
 .map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>);
};

const ChatMessageBubble = ({
 message,
 index,
}: {
 message: ChatMessage;
 index: number;
}) => {
 const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  usePageTitle('المحادثة الذكية');
 const { reasoning, response } = parseAssistantContent(message.content);
 const isAssistant = message.role ==='assistant';

 return (
 <motion.li
 className={`chat-message ${message.role}`}
 key={`${message.role}-${index}`}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.28 }}
 >
 <Avatar
 size='md'
 isBordered
 src={isAssistant ?'/images/ai-icon.png' : undefined}
 name={isAssistant ?'AI' :'أنت'}
 className='chat-avatar'
 />
 <div className="chat-bubble-stack">
 {reasoning ? (
 <div className={`chat-reasoning ${isReasoningOpen ?'open' :''}`}>
 <button
 aria-label="عرض التفكير" aria-expanded={isReasoningOpen} className="chat-reasoning-trigger"
 type="button"
 onClick={() => setIsReasoningOpen((prev) => !prev)}
 >
 <span className="chat-reasoning-label">
 <LuWandSparkles />
 طريقة التحليل
 </span>
 <LuChevronDown className="chat-reasoning-chevron" />
 </button>
 <AnimatePresence initial={false}>
 {isReasoningOpen ? (
 <motion.div
 className="chat-reasoning-content"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height:'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.22 }}
 >
 <div>{renderParagraphs(reasoning)}</div>
 </motion.div>
 ) : null}
 </AnimatePresence>
 </div>
 ) : null}
 <div className="chat-bubble">
 {renderParagraphs(response || message.content)}
 </div>
 </div>
 </motion.li>
 );
};

const Chat = () => {
 const [messages, setMessages] = useState<ChatMessage[]>([])
 const [isLoading, setIsLoading] = useState(false)
 const [conversationId, setConversationId] = useState<string | null>(null)
 const messagesEndRef = useRef<HTMLDivElement>(null)

 const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<chatFormType>({
 mode:'onChange',
 resolver: zodResolver(chatFormSchema),
 })
 const messageValue = watch('message') ??'';

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
 }, [messages])

 const onSubmit: SubmitHandler<chatFormType> = async (data) => {
 const userMessage = data.message;
 setMessages(prev => [...prev, { role:'user', content: userMessage }]);
 reset();
 setIsLoading(true);

 try {
 const response = await api.post(API_ROUTES.SEND_CHAT_MESSAGE, {
 message: userMessage,
 conversationId: conversationId,
 });

 const result = response.data?.data;
 if (result?.conversationId) {
 setConversationId(result.conversationId);
 }

 if (result?.messages) {
 const assistantMessage = result.messages.find((m: { role: string }) => m.role ==='assistant');
 if (assistantMessage) {
 setMessages(prev => [...prev, { role:'assistant', content: assistantMessage.content }]);
 } else if (result.availabilityState ==='error') {
 setMessages(prev => [...prev, { role:'assistant', content:'عذراً، لم أتمكن من معالجة رسالتك. حاول مرة أخرى أو أعد الاتصال.' }]);
 }
 }
 } catch {
 setMessages(prev => [...prev, { role:'assistant', content:'عذراً، لم أتمكن من معالجة رسالتك. حاول مرة أخرى.' }]);
 sileo.error({ title:'تعذّر إرسال الرسالة. تحقق من اتصالك.' });
 } finally {
 setIsLoading(false);
 }
 }

 return (
 <section className='chat'>
 <Container>
 <HeadTitle title='المساعد القانوني الذكي' />
 <div className="chat-container">
 <div className="chat-body">
 {messages.length < 1 ? (
 <div className="not-message">
 <div className="chat-empty-icon">
 <IoChatbubbleEllipsesOutline />
 </div>
 <h3>أهلاً بك في المساعد القانوني</h3>
 <p>اطرح سؤالك بصياغة واضحة، وسأرتب لك الرد القانوني بشكل عملي ومباشر.</p>
 <div className="chat-empty-suggestions">
 <div className="chat-suggestion-card">
 <LuScale />
 <span>تلخيص موقف قانوني</span>
 </div>
 <div className="chat-suggestion-card">
 <IoSparklesOutline />
 <span>صياغة رد أو مذكرة</span>
 </div>
 <div className="chat-suggestion-card">
 <LuWandSparkles />
 <span>تحليل مستند أو واقعة</span>
 </div>
 </div>
 </div>
 ) : (
 <ul className='chat-messages'>
 <AnimatePresence>
 {messages.map((message, idx) => (
 <ChatMessageBubble message={message} index={idx} key={`${message.role}-${idx}-${message.content.slice(0, 16)}`} />
 ))}
 </AnimatePresence>
 {isLoading && (
 <li className='chat-message assistant loading'>
 <Avatar size='md' isBordered src="/images/ai-icon.png" name="AI" className='chat-avatar' />
 <div className="chat-bubble-stack">
 <div className="chat-reasoning open loading">
 <div className="chat-reasoning-trigger static">
 <span className="chat-reasoning-label">
 <LuWandSparkles />
 جاري تحليل السؤال
 </span>
 </div>
 <div className="chat-reasoning-content">
 <p>أراجع العناصر القانونية في السؤال وأجهز الرد الأنسب.</p>
 </div>
 </div>
 <div className="chat-bubble assistant typing-bubble">
 <span className='typing-indicator'>جاري تجهيز الرد...</span>
 </div>
 </div>
 </li>
 )}
 <div ref={messagesEndRef} />
 </ul>
 )}

 </div>
 <form className="chat-footer"
 onSubmit={handleSubmit(onSubmit)}
 >
 <div className="chat-footer-header">
 <span className="chat-footer-hint">اكتب التفاصيل المهمة وسأبني الرد على أساسها</span>
 </div>
 <Textarea
 className="textarea-box"
 label="اكتب سؤالك القانوني..." placeholder="اكتب سؤالك القانوني..."
 isInvalid={!!errors.message}
 errorMessage={errors.message?.message}
 isDisabled={isLoading}
 minRows={3}
 maxRows={8}
 {...register('message')}
 />
 <div className='chat-footer-actions'>
 <CustomButton
 type='submit'
 text='ارسل'
 endContent={<VscSend className='rotate-180' size={20} />}
 size='md'
 radius='full'
 color='primary'
 isLoading={isLoading}
 isDisabled={isLoading || !messageValue.trim()}
 />
 </div>
 </form>
 </div>
 </Container>
 </section>
 );
};

export default Chat;
