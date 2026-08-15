import { SignIn, SignUp } from "@clerk/clerk-react";
import { Building2, ReceiptText, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@shared/components/ui/button";

type AuthMode = "login" | "register";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox:
      "w-full max-w-none overflow-hidden rounded-lg border-0 shadow-none sm:border sm:border-emerald-950/10",
    card: "w-full shadow-none bg-white",
    headerTitle: "text-lg sm:text-xl",
    headerSubtitle: "text-sm",
    formButtonPrimary: "h-10 bg-emerald-700 hover:bg-emerald-800",
    footerActionLink: "text-emerald-700 hover:text-emerald-800",
    formFieldInput: "rounded-md border-stone-200 focus:ring-emerald-700",
  },
};

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    const syncMode = () =>
      setMode(window.location.hash === "#register" ? "register" : "login");
    syncMode();
    window.addEventListener("hashchange", syncMode);
    return () => window.removeEventListener("hashchange", syncMode);
  }, []);

  const changeMode = (nextMode: AuthMode) => {
    window.location.hash = nextMode === "register" ? "register" : "login";
    setMode(nextMode);
  };

  return (
    <main className="min-h-screen bg-white px-4 py-5 text-stone-950 sm:bg-[#f4f7f3] sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-10 lg:px-10">
      <section className="hidden max-w-3xl flex-col justify-center py-8 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white shadow-sm shadow-emerald-950/20">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">OPSN</h1>
            <p className="text-sm text-stone-500">Gestione affitti familiari</p>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Accesso protetto
          </p>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-normal text-stone-950 sm:text-4xl">
            Controlla immobili, incassi, quote e saldi proprietari in un unico
            posto.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            Accedi con Clerk per usare il gestionale e proteggere dashboard,
            movimenti, report e anagrafiche.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:max-w-lg sm:gap-3">
          <div className="rounded-lg border border-emerald-950/10 bg-white/90 p-3 shadow-sm shadow-emerald-950/5">
            <WalletCards className="mb-3 text-emerald-700" size={18} />
            <p className="text-xs uppercase text-stone-500">Saldi</p>
            <p className="mt-1 text-sm font-semibold">Sempre sotto controllo</p>
          </div>
          <div className="rounded-lg border border-emerald-950/10 bg-white/90 p-3 shadow-sm shadow-emerald-950/5">
            <ReceiptText className="mb-3 text-emerald-700" size={18} />
            <p className="text-xs uppercase text-stone-500">Movimenti</p>
            <p className="mt-1 text-sm font-semibold">
              Entrate e uscite chiare
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-sm flex-col justify-center py-2 sm:max-w-md lg:min-h-0 lg:items-center">
        <div className="mb-5 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white shadow-sm shadow-emerald-950/20">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">OPSN</h1>
            <p className="text-xs text-stone-500">Gestione affitti familiari</p>
          </div>
        </div>
        <div className="w-full space-y-3 bg-white sm:space-y-4 sm:rounded-lg sm:border sm:border-emerald-950/10 sm:bg-white/80 sm:p-4 sm:shadow-lg sm:shadow-emerald-950/10 sm:backdrop-blur">
          <div className="grid grid-cols-2 rounded-md border border-emerald-950/10 bg-emerald-50/60 p-1">
            <Button
              variant={mode === "login" ? "default" : "ghost"}
              onClick={() => changeMode("login")}
            >
              Login
            </Button>
            <Button
              variant={mode === "register" ? "default" : "ghost"}
              onClick={() => changeMode("register")}
            >
              Registrati
            </Button>
          </div>
          {mode === "login" ? (
            <SignIn
              routing="hash"
              signUpUrl="#register"
              appearance={clerkAppearance}
            />
          ) : (
            <SignUp
              routing="hash"
              signInUrl="#login"
              appearance={clerkAppearance}
            />
          )}
        </div>
      </section>
    </main>
  );
}
