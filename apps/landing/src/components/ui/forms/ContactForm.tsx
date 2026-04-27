'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Textarea } from "@heroui/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ContactForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !phone.trim() || !message.trim()) return;

        if (!API_BASE_URL) {
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch(`${API_BASE_URL}/contact/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), phone: phone.trim(), message: message.trim() }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setName('');
                setPhone('');
                setMessage('');
            } else {
                setSubmitStatus('error');
            }
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="w-full md:w-9/12 mt-10 p-6 bg-green-50 rounded-lg text-center" dir="rtl">
                <h3 className="text-xl font-bold text-green-700 mb-2">تم إرسال رسالتك بنجاح</h3>
                <p className="text-green-600 mb-4">سنتواصل معك في أقرب وقت ممكن</p>
                <Button
                    className="bg-primary-500 text-white"
                    onPress={() => setSubmitStatus('idle')}
                >
                    إرسال رسالة أخرى
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full md:w-9/12 flex flex-col gap-8 mt-10" dir="rtl">
        <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <Input
                type="text"
                placeholder='الاسم بالكامل'
                value={name}
                onValueChange={setName}
                isRequired
                isDisabled={isSubmitting}
            />
            <Input
                type="tel"
                placeholder='رقم الهاتف'
                value={phone}
                onValueChange={setPhone}
                isRequired
                isDisabled={isSubmitting}
            />
            <Textarea
                className="w-full"
                placeholder="الرسالة"
                value={message}
                onValueChange={setMessage}
                isRequired
                isDisabled={isSubmitting}
            />
            {submitStatus === 'error' && (
                <p className="text-red-500 text-sm">حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.</p>
            )}
            <Button
                className='w-full bg-primary-500 text-white'
                type="submit"
                isLoading={isSubmitting}
                isDisabled={!name.trim() || !phone.trim() || !message.trim()}
            >
                إرسال
            </Button>
        </Form>
        </div>
    );
};

export default ContactForm;
