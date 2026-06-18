import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../APIs/api";
import { axiosErrorHandler } from "@mohamy/shared-api";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelpers";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lawyerId: string;
  onSuccess: () => void;
};

const ChangePasswordModal = ({
  isOpen,
  onClose,
  lawyerId,
  onSuccess,
}: ChangePasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTooShort = password.length > 0 && password.length < 8;

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError("أدخل كلمة المرور الجديدة");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/lawyers/${lawyerId}/password`, {
        newPassword: password,
      });
      showSuccessToast("تم تغيير كلمة المرور بنجاح");
      onSuccess();
      handleClose();
    } catch (err) {
      const msg = axiosErrorHandler(err);
      setError(msg);
      showErrorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setIsVisible(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      size="md"
      classNames={{
        base: "rounded-3xl mx-4 my-4 backdrop-blur-2xl bg-white/70 dark:bg-[#161616]/70 border border-white/30 dark:border-white/10 shadow-2xl",
        backdrop: "bg-[#1b1b1b]/20 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-0" dir="rtl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--accent-soft)" }}
            >
              <FaLock
                className="text-xl"
                style={{ color: "var(--main-color)" }}
              />
            </div>
            <span className="text-base font-bold text-[var(--title-color)]">
              تغيير كلمة المرور
            </span>
          </div>
        </ModalHeader>

        <ModalBody dir="rtl" className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            أدخل كلمة المرور الجديدة للمحامي. سيتم تسجيل خروجه من جميع الأجهزة.
          </p>

          <Input
            type={isVisible ? "text" : "password"}
            label="كلمة المرور الجديدة"
            placeholder="8 أحرف على الأقل"
            value={password}
            onValueChange={(val) => {
              setPassword(val);
              if (error) setError(null);
            }}
            isInvalid={isTooShort || Boolean(error)}
            errorMessage={
              isTooShort
                ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                : error ?? undefined
            }
            endContent={
              <button
                type="button"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none"
                onClick={() => setIsVisible(!isVisible)}
                aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {isVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
            classNames={{
              inputWrapper:
                "rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)]",
              label: "text-[var(--text-secondary)]",
            }}
          />
        </ModalBody>

        <ModalFooter dir="rtl" className="flex gap-2 justify-end pt-2">
          <Button
            variant="flat"
            onPress={handleClose}
            isDisabled={isLoading}
            className="font-bold text-sm bg-white/50 dark:bg-white/10 text-[var(--title-color)] border border-white/40 dark:border-white/10 backdrop-blur-md"
          >
            إلغاء
          </Button>
          <Button
            onPress={handleConfirm}
            isLoading={isLoading}
            isDisabled={!password.trim() || password.length < 8}
            className="font-bold text-sm text-white bg-[var(--main-color)] hover:opacity-90"
          >
            تغيير كلمة المرور
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
