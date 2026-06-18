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
import { FaRobot } from "react-icons/fa";
import api from "../../APIs/api";
import { axiosErrorHandler } from "@mohamy/shared-api";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelpers";

type AdjustPointsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  lawyerId: string;
  onSuccess: () => void;
};

const AdjustPointsModal = ({
  isOpen,
  onClose,
  currentBalance,
  lawyerId,
  onSuccess,
}: AdjustPointsModalProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = amount === "" || amount === "-" ? 0 : Number(amount);
  const projectedBalance = currentBalance + parsedAmount;
  const isInvalid = projectedBalance < 0;

  const handleConfirm = async () => {
    if (!amount || parsedAmount === 0) {
      setError("أدخل قيمة مختلفة عن الصفر");
      return;
    }
    if (isInvalid) {
      setError("لا يمكن أن يكون الرصيد أقل من صفر");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/lawyers/${lawyerId}/ai-points`, {
        amount: parsedAmount,
      });
      showSuccessToast("تم تعديل نقاط الذكاء الاصطناعي بنجاح");
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
    setAmount("");
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
              <FaRobot
                className="text-xl"
                style={{ color: "var(--main-color)" }}
              />
            </div>
            <span className="text-base font-bold text-[var(--title-color)]">
              تعديل نقاط الذكاء الاصطناعي
            </span>
          </div>
        </ModalHeader>

        <ModalBody dir="rtl" className="space-y-4">
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)] p-3">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              الرصيد الحالي
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
              {currentBalance} نقطة
            </p>
          </div>

          <Input
            type="number"
            label="القيمة (يمكن أن تكون سالبة للخصم)"
            placeholder="مثال: 10 أو -5"
            value={amount}
            onValueChange={(val) => {
              setAmount(val);
              if (error) setError(null);
            }}
            isInvalid={isInvalid || Boolean(error)}
            errorMessage={
              isInvalid ? "لا يمكن أن يكون الرصيد أقل من صفر" : error ?? undefined
            }
            classNames={{
              inputWrapper:
                "rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)]",
              label: "text-[var(--text-secondary)]",
            }}
          />

          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)] p-3">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              الرصيد الجديد
            </p>
            <p
              className={`mt-1 text-lg font-bold ${
                isInvalid
                  ? "text-red-600"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {projectedBalance} نقطة
            </p>
          </div>
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
            isDisabled={isInvalid || !amount || parsedAmount === 0}
            className="font-bold text-sm text-white bg-[var(--main-color)] hover:opacity-90"
          >
            تأكيد التعديل
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdjustPointsModal;
