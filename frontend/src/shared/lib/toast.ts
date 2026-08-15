import { toast } from "sonner";

export type ToastTone = "success" | "error";

export function notifyToast(message: string, tone: ToastTone = "success") {
  toast[tone](message);
}

export function notifyInvalidSubmit() {
  notifyToast("Compila i campi obbligatori evidenziati", "error");
}
