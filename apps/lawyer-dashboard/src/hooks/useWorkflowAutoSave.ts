import { useCallback, useEffect, useRef, useState } from'react';

interface AutoSaveConfig {
 delay?: number;
 mode?: 'debounced' | 'immediate';
 onSave: (payload: unknown) => Promise<void>;
 disabled?: boolean;
}

export function useWorkflowAutoSave({ delay = 2000, mode ='debounced', onSave, disabled = false }: AutoSaveConfig) {
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const pendingPayloadRef = useRef<unknown>(null);
   const lastSavedDigestRef = useRef<string>('');
   const isSavingRef = useRef(false);
   const onSaveRef = useRef(onSave);
   const mountedRef = useRef(true);
   const [isSaving, setIsSaving] = useState(false);
   const flushCountRef = useRef(0);
   const disabledRef = useRef(disabled);
   const pendingWhileDisabledRef = useRef<unknown>(null);

   onSaveRef.current = onSave;
   disabledRef.current = disabled;

  useEffect(() => {
  return () => { mountedRef.current = false; };
  }, []);

 const flush = useCallback(async (payloadOverride?: unknown) => {
  if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
  }

  const payload = payloadOverride ?? pendingPayloadRef.current;
  if (payload == null) {
  return;
  }

  if (isSavingRef.current) {
  pendingPayloadRef.current = payload;
  return;
  }

  const flushId = ++flushCountRef.current;

  const digest = JSON.stringify(payload);
 if (digest === lastSavedDigestRef.current) {
 return;
 }

 pendingPayloadRef.current = null;
 lastSavedDigestRef.current = digest;

 isSavingRef.current = true;
 setIsSaving(true);
 try {
 await onSaveRef.current(payload);
 } catch {
 if (flushCountRef.current === flushId) {
 lastSavedDigestRef.current ='';
 pendingPayloadRef.current = payload;
 }
  } finally {
  isSavingRef.current = false;
  if (mountedRef.current) setIsSaving(false);

 if (flushCountRef.current === flushId && pendingPayloadRef.current != null) {
 const pending = pendingPayloadRef.current;
 pendingPayloadRef.current = null;
 void flush(pending);
 }
 }
 }, []);

 const cancel = useCallback(() => {
 if (timeoutRef.current) {
 clearTimeout(timeoutRef.current);
 timeoutRef.current = null;
 }
 pendingPayloadRef.current = null;
 }, []);

 const debouncedSave = useCallback(
 (payload: unknown) => {
 if (disabledRef.current) {
 pendingWhileDisabledRef.current = payload;
 return;
 }

 pendingPayloadRef.current = payload;

 if (mode ==='immediate') {
 void flush(payload);
 return;
 }

 if (timeoutRef.current) {
 clearTimeout(timeoutRef.current);
 }

 timeoutRef.current = setTimeout(() => {
 void flush();
 }, delay);
 },
 [delay, flush, mode]
 );

 useEffect(() => {
 if (!disabled && pendingWhileDisabledRef.current != null) {
 const pending = pendingWhileDisabledRef.current;
 pendingWhileDisabledRef.current = null;
 void flush(pending);
 }
 }, [disabled, flush]);

 useEffect(() => {
 return () => {
 cancel();
 };
 }, [cancel]);

 return { debouncedSave, flush, cancel, isSaving };
}
