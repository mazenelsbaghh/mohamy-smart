import { CustomButton } from'@mohamy/shared-ui';
import { useEffect, useMemo, useState } from'react';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { fetchAiModelConfig } from'../../redux/aiModelConfig/thunk/fetchAiModelConfig';
import { updateAiModelConfig } from'../../redux/aiModelConfig/thunk/updateAiModelConfig';
import { clearAiModelConfigError } from'../../redux/aiModelConfig/aiModelConfigSlice';
import { showSuccessToast, showErrorToast } from'../../utils/toastHelpers';

import { Select, SelectItem } from'@heroui/react';
import type { AiStageModelConfig, UpdateAiModelConfigItem } from'../../types';

const MODEL_OPTIONS = [
 { key:'gemini-3.5-flash', label:'Gemini 3.5 Flash', tier:'الأعلى' },
 { key:'gemini-3-flash-preview', label:'Flash 3' },
 { key:'gemini-3.1-flash-lite-preview', label:'Flash Lite 3.1' },
 { key:'gemini-3.1-pro-preview', label:'Pro 3.1' },
];

const HIGHEST_MODEL_IDENTIFIER = 'gemini-3.5-flash';
const LAWSUIT_SUBJECTS_STEP = 12;
const LAWSUIT_FACTS_STEP = 13;
const hiddenStepTypes = new Set([LAWSUIT_FACTS_STEP]);

const getModelLabel = (modelIdentifier: string) => {
 const model = MODEL_OPTIONS.find(option => option.key === modelIdentifier);
 return model?.label || modelIdentifier;
};

const AiModelSettings = () => {
 const dispatch = useAppDispatch();
 const { configs, isLoading, error } = useAppSelector((state) => state.aiModelConfig);
 const [localConfigs, setLocalConfigs] = useState<Record<number, string>>({});

 useEffect(() => {
 dispatch(fetchAiModelConfig());
 }, [dispatch]);

 useEffect(() => {
 if (configs.length > 0) {
 const map: Record<number, string> = {};
 configs.forEach(c => {
 map[c.stepType] = c.modelIdentifier;
 });
 setLocalConfigs(map);
 }
 }, [configs]);

 useEffect(() => {
 if (error) {
 showErrorToast(error);
 dispatch(clearAiModelConfigError());
 }
 }, [error, dispatch]);

 const groupedConfigs = useMemo(() => {
 const groups: Record<string, AiStageModelConfig[]> = {};
 configs
 .filter(c => !hiddenStepTypes.has(c.stepType))
 .map(c => c.stepType === LAWSUIT_SUBJECTS_STEP
 ? { ...c, displayName:'موضوع الدعوى ووقائعها' }
 : c)
 .forEach(c => {
 if (!groups[c.category]) {
 groups[c.category] = [];
 }
 groups[c.category].push(c);
 });
 return groups;
 }, [configs]);

 const groupedEntries = useMemo(() => Object.entries(groupedConfigs), [groupedConfigs]);

 const handleModelChange = (stepType: number, modelIdentifier: string) => {
 setLocalConfigs(prev => ({ ...prev, [stepType]: modelIdentifier }));
 };

 const handleSave = async () => {
 const updates: UpdateAiModelConfigItem[] = Object.entries(localConfigs)
    .filter(([, modelIdentifier]) => modelIdentifier !== '')
    .filter(([stepType]) => !hiddenStepTypes.has(Number(stepType)))
    .map(([stepType, modelIdentifier]) => ({
    stepType: Number(stepType),
    modelIdentifier,
    }));

 const result = await dispatch(updateAiModelConfig({ configs: updates }));
 if (updateAiModelConfig.fulfilled.match(result)) {
 showSuccessToast('تم حفظ إعدادات النماذج بنجاح');
 }
 };

 const hasChanges = useMemo(() => {
 return configs
 .filter(c => !hiddenStepTypes.has(c.stepType))
 .some(c => localConfigs[c.stepType] !== c.modelIdentifier);
 }, [configs, localConfigs]);

 return (
 <div className="py-6" dir="rtl">
 <div className="max-w-5xl">
 <div className="mb-6 rounded-2xl border p-4" style={{ backgroundColor:'var(--surface-muted)', borderColor:'var(--border-color)' }}>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-sm font-semibold text-[var(--text-color)]">إعدادات موديلات الذكاء الاصطناعي</p>
 <h3 className="mt-1 text-xl font-bold text-[var(--title-color)]">الخطوات والموديل المستخدم في كل خطوة</h3>
 </div>
 <span className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
 Gemini 3.5 Flash هو الأعلى
 </span>
 </div>
 </div>

 {groupedEntries.map(([category, categoryConfigs]) => {
 if (!categoryConfigs || categoryConfigs.length === 0) return null;

 return (
 <section key={category} className="mb-8">
 <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-strong)] pb-2">
 <h3 className="text-lg font-bold text-primary-600">
 {category}
 </h3>
 <span className="text-sm text-[var(--text-color)]">{categoryConfigs.length} خطوات</span>
 </div>
 <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
 {categoryConfigs.map((config, index) => {
 const selectedModel = localConfigs[config.stepType] || config.modelIdentifier;
 const isHighestSelected = selectedModel === HIGHEST_MODEL_IDENTIFIER;

 return (
 <div key={config.stepType} className="rounded-2xl border p-4" style={{ backgroundColor:'var(--surface-color)', borderColor:'var(--border-color)' }}>
 <div className="mb-3 flex items-start gap-3">
 <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-bold text-primary-600">
 {index + 1}
 </span>
 <div className="min-w-0 flex-1">
 <p className="text-sm text-[var(--text-color)]">الخطوة {index + 1}</p>
 <h4 className="text-base font-bold text-[var(--title-color)]">{config.displayName}</h4>
 </div>
 <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${isHighestSelected ?'bg-primary-500 text-white' :'bg-[var(--surface-muted)] text-[var(--text-color)]'}`}>
 {isHighestSelected ?'الموديل الأعلى' : getModelLabel(selectedModel)}
 </span>
 </div>
 <Select
 label="الموديل"
 selectedKeys={[selectedModel]}
 onChange={(e) => handleModelChange(config.stepType, e.target.value)}
 className="w-full"
 dir="rtl"
 >
 {MODEL_OPTIONS.map(option => (
 <SelectItem key={option.key} textValue={option.tier ? `${option.label} - ${option.tier}` : option.label}>
 <div className="flex w-full items-center justify-between gap-3">
 <span>{option.label}</span>
 {option.tier && (
 <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
 {option.tier}
 </span>
 )}
 </div>
 </SelectItem>
 ))}
 </Select>
 </div>
 );
 })}
 </div>
 </section>
 );
 })}

 <div className="w-full flex justify-end mt-8 p-4">
 <CustomButton
 type='button'
 text='حفظ الإعدادات'
 radius='md'
 size='lg'
 color="primary"
 isLoading={isLoading}
 isDisabled={!hasChanges}
 onClick={handleSave}
 />
 </div>
 </div>
 </div>
 );
};

export default AiModelSettings;
