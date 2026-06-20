import { Button } from"@heroui/react";

type FormFooterProps = {
 onCancel: () => void;
 submitLabel: string;
 cancelLabel?: string;
 isLoading?: boolean;
 isDisabled?: boolean;
 loadingLabel?: string;
};

/**
 * Standard form footer: cancel (light, right) + submit (primary, left).
 * Place at the bottom of any form. The form element handles the submit event.
 */
const FormFooter = ({
 onCancel,
 submitLabel,
 cancelLabel ="إلغاء",
 isLoading,
 isDisabled,
 loadingLabel,
}: FormFooterProps) => {
 const controlsDisabled = Boolean(isLoading || isDisabled);

 return (
 <div
 className="flex items-center justify-between pt-4 border-t app-border"
 dir="rtl"
 >
 <Button
 variant="light"
 type="button"
 onPress={onCancel}
 isDisabled={controlsDisabled}
 className="app-text-muted font-medium"
 >
 {cancelLabel}
 </Button>
 <Button
 color="primary"
 type="submit"
 isLoading={isLoading}
 isDisabled={controlsDisabled}
 className="text-white rounded-xl px-8"
 >
 {isLoading && loadingLabel ? loadingLabel : submitLabel}
 </Button>
 </div>
 );
};

export default FormFooter;
