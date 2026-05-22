import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { CustomInput, CustomButton } from '@mohamy/shared-ui';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import thunkChangePhoneRequest from '../../../redux/settings/thunk/thunkChangePhoneRequest';
import thunkChangePhoneVerify from '../../../redux/settings/thunk/thunkChangePhoneVerify';
import { sileo } from "sileo";

interface ChangePhoneModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ChangePhoneModal = ({ isOpen, onOpenChange }: ChangePhoneModalProps) => {
  const dispatch = useAppDispatch();
  const { changePhoneLoading } = useAppSelector((state) => state.settings);
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleRequest = () => {
    if (!currentPassword || !newPhoneNumber) {
      sileo.error({ title: 'يرجى إدخال كلمة المرور ورقم الهاتف الجديد' });
      return;
    }

    dispatch(thunkChangePhoneRequest({ currentPassword, newPhoneNumber }))
      .unwrap()
      .then(() => {
        sileo.success({ title: 'تم إرسال رمز التحقق إلى رقم الهاتف الجديد' });
        setStep('verify');
      })
      .catch((err) => {
        sileo.error({ title: err || 'حدث خطأ أثناء طلب التغيير' });
      });
  };

  const handleVerify = () => {
    if (!otpCode) {
      sileo.error({ title: 'يرجى إدخال رمز التحقق' });
      return;
    }

    dispatch(thunkChangePhoneVerify({ otpCode }))
      .unwrap()
      .then(() => {
        sileo.success({ title: 'تم تغيير رقم الهاتف بنجاح' });
        handleClose();
        // Option to reload profile here
        window.location.reload();
      })
      .catch((err) => {
        sileo.error({ title: err || 'حدث خطأ أثناء التحقق' });
      });
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('request');
    setCurrentPassword('');
    setNewPhoneNumber('');
    setOtpCode('');
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} dir="rtl" placement="center" classNames={{ base: "rounded-3xl mx-4 my-4" }}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {step === 'request' ? 'تغيير رقم الهاتف' : 'التحقق من رقم الهاتف'}
            </ModalHeader>
            <ModalBody>
              {step === 'request' ? (
                <div className="flex flex-col gap-4">
                  <CustomInput
                    label="كلمة المرور الحالية"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <CustomInput
                    label="رقم الهاتف الجديد"
                    type="text"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-500">
                    أدخل رمز التحقق (OTP) الذي تم إرساله إلى رقم هاتفك الجديد.
                  </p>
                  <CustomInput
                    label="رمز التحقق"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                إلغاء
              </Button>
              {step === 'request' ? (
                <CustomButton
                  type="button"
                  radius="md"
                  size="md"
                  text="متابعة"
                  color="primary"
                  onClick={handleRequest}
                  isLoading={changePhoneLoading === 'pending'}
                />
              ) : (
                <CustomButton
                  type="button"
                  radius="md"
                  size="md"
                  text="تحقق وحفظ"
                  color="primary"
                  onClick={handleVerify}
                  isLoading={changePhoneLoading === 'pending'}
                />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChangePhoneModal;
