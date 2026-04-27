import { sileo } from'sileo';

export const showSuccessToast = (msg: string) => {
 sileo.success({
 title: msg,
 duration: 3000,
 });
};

export const showErrorToast = (msg: string) => {
 sileo.error({
 title: msg,
 duration: 4000,
 });
};

export const showLoadingToast = (msg: string) => {
 return sileo.show({
 type:'loading',
 title: msg,
 });
};

export const dismissToast = (toastId: string) => {
 sileo.dismiss(toastId);
};

export const settingsToastMessages = {
 profileLoading:'جاري تحميل بيانات الملف الشخصي...',
 profileLoaded:'تم تحميل بيانات الملف الشخصي بنجاح',
 profileLoadFailed:'فشل في تحميل بيانات الملف الشخصي',
 profileUpdating:'جاري تحديث بيانات الملف الشخصي...',
 profileUpdated:'تم تحديث بيانات الملف الشخصي بنجاح',
 profileUpdateFailed:'فشل في تحديث بيانات الملف الشخصي',
 passwordChanging:'جاري تغيير كلمة المرور...',
 passwordChanged:'تم تغيير كلمة المرور بنجاح',
 passwordChangeFailed:'فشل في تغيير كلمة المرور',
};
