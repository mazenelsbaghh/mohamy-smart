import { CustomButton } from'@mohamy/shared-ui';
import { useEffect, useMemo, useState } from'react';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { fetchAiModelConfig } from'../../redux/aiModelConfig/thunk/fetchAiModelConfig';
import { updateAiModelConfig } from'../../redux/aiModelConfig/thunk/updateAiModelConfig';
import { clearAiModelConfigError } from'../../redux/aiModelConfig/aiModelConfigSlice';
import { showSuccessToast, showErrorToast } from'../../utils/toastHelpers';

import { Select, SelectItem } from'@heroui/react';
import type { UpdateAiModelConfigItem } from'../../types';

const MODEL_OPTIONS = [
 { key:'gemini-3.5-flash', label:'Gemini 3.5 Flash' },
 { key:'gemini-3-flash-preview', label:'Flash 3' },
 { key:'gemini-3.1-flash-lite-preview', label:'Flash Lite 3.1' },
 { key:'gemini-3.1-pro-preview', label:'Pro 3.1' },
];

const LAWSUIT_SUBJECTS_STEP = 12;
const LAWSUIT_FACTS_STEP = 13;
const hiddenStepTypes = new Set([LAWSUIT_FACTS_STEP]);

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
 const groups: Record<string, typeof configs> = {};
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
 <div className="max-w-4xl">
 {Object.keys(groupedConfigs).map(category => {
 const categoryConfigs = groupedConfigs[category];
 if (!categoryConfigs || categoryConfigs.length === 0) return null;

 return (
 <div key={category} className="mb-8">
 <h3 className="text-lg font-bold mb-4 text-primary-600 border-b app-border-strong pb-2">
 {category}
 </h3>
 <div className="flex flex-wrap gap-4">
 {categoryConfigs.map(config => (
 <div key={config.stepType} className="w-full md:w-5/12 p-2">
 <Select
 label={config.displayName}
 selectedKeys={[localConfigs[config.stepType] || config.modelIdentifier]}
 onChange={(e) => handleModelChange(config.stepType, e.target.value)}
 className="w-full"
 dir="rtl"
 >
 {MODEL_OPTIONS.map(option => (
 <SelectItem key={option.key}>
 {option.label}
 </SelectItem>
 ))}
 </Select>
 </div>
 ))}
 </div>
 </div>
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
