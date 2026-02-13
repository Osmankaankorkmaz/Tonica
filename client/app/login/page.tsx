"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/components/providers/LocaleProvider";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearAuthError, loginThunk } from "@/lib/store/authSlice";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** --- Icons --- */
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m6 8 6 5 6-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.5 11V8.5A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 4.5 4.5V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 11h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.5 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a15.3 15.3 0 0 1-3.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.2 8.6C3.6 10.8 2.5 12 2.5 12s3.5 7 9.5 7c1.2 0 2.3-.2 3.3-.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** --- UI pieces --- */
function Field({
  label,
  icon,
  children,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-2xl border px-3 py-3.5 transition",
          "border-slate-200 bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200/60",
          "dark:border-white/10 dark:bg-slate-950/40 dark:focus-within:border-sky-500/50 dark:focus-within:ring-sky-900/40"
        )}
      >
        <span className="text-slate-400 transition group-focus-within:text-blue-600 dark:group-focus-within:text-sky-300">
          {icon}
        </span>
        {children}
      </div>
      {hint ? <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </label>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{desc}</div>
    </div>
  );
}

export default function TonicaLoginPage() {
  const { lang, ready } = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const copy = useMemo(() => {
    const tr = {
      brand: "TONICA",
      badgeTop: "TONICA OTURUM",
      title: "Giriş Yap",
      subtitle: "Tonica hesabınla devam et.",
      noAccount: "Hesabın yok mu?",
      register: "Kayıt ol",
      secure: "Güvenli giriş",
      email: "E-posta",
      emailPh: "ornek@tonica.app",
      password: "Şifre",
      passwordPh: "Şifren",
      remember: "Beni hatırla",
      forgot: "Şifremi unuttum",
      loginBtn: "Giriş Yap",
      logging: "Giriş yapılıyor...",
      kvkkText1: "Giriş yaparak",
      kvkk: "KVKK",
      kvkkText2: "ve",
      cookies: "Çerez Politikası",
      kvkkText3: "metinlerini kabul etmiş olursun.",
      quickTitle: "Hızlı erişim",
      quickDesc: "Board’a, focus planına ve AI önerilerine tek ekrandan ulaş.",
      i1t: "Board akışı",
      i1d: "Todo → Doing → Done ile ilerlemeyi görünür kıl.",
      i2t: "AI destek",
      i2d: "Başlık, etiket ve sonraki adım önerileriyle hızlan.",
      i3t: "Focus Plan",
      i3d: "Bugün için küçük ve uygulanabilir bir plan oluştur.",
      i4t: "Güvenli oturum",
      i4d: "Oturum çerezleri ile güvenli şekilde korunur.",
      noteT: "Bilgilendirme",
      noteD: "Tonica, odak ve üretkenlik için tasarlanmıştır. Kontrol her zaman sende.",
      footer: "©",
    };

    const en = {
      brand: "TONICA",
      badgeTop: "TONICA SESSION",
      title: "Sign in",
      subtitle: "Continue with your Tonica account.",
      noAccount: "No account yet?",
      register: "Create one",
      secure: "Secure sign-in",
      email: "Email",
      emailPh: "you@tonica.app",
      password: "Password",
      passwordPh: "Your password",
      remember: "Remember me",
      forgot: "Forgot password",
      loginBtn: "Sign in",
      logging: "Signing in...",
      kvkkText1: "By signing in, you agree to the",
      kvkk: "Privacy",
      kvkkText2: "and",
      cookies: "Cookie Policy",
      kvkkText3: ".",
      quickTitle: "Quick access",
      quickDesc: "Jump into your board, focus plan and AI suggestions in seconds.",
      i1t: "Board flow",
      i1d: "Make progress visible with Todo → Doing → Done.",
      i2t: "AI assist",
      i2d: "Speed up with title, tag and next-step suggestions.",
      i3t: "Focus Plan",
      i3d: "Generate a small, doable plan for today.",
      i4t: "Secure session",
      i4d: "Protected with secure session cookies.",
      noteT: "Note",
      noteD: "Tonica is designed for focus and productivity. You stay in control.",
      footer: "©",
    };

    return lang === "tr" ? tr : en;
  }, [lang]);

  const canSubmit = useMemo(() => !!email.trim() && !!password && !loading, [email, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearAuthError());

    const res = await dispatch(loginThunk({ email: email.trim(), password }));
    if (loginThunk.fulfilled.match(res)) router.push("/account"); // istersen "/todos"
  }

  if (!ready) {
    return (
      <main className="min-h-[calc(100vh-72px)]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="h-8 w-40 rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-2xl bg-blue-50 dark:bg-slate-900/60" />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="h-96 rounded-3xl bg-blue-50 dark:bg-slate-900/60" />
            <div className="h-96 rounded-3xl bg-blue-50 dark:bg-slate-900/60" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] bg-white dark:bg-slate-950">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-56 w-130 -translate-x-1/2 rounded-full bg-blue-600/12 blur-3xl sm:h-72 sm:w-190 dark:bg-sky-400/10" />
        <div className="absolute -bottom-40 -right-30 h-56 w-56 rounded-full bg-sky-400/12 blur-3xl sm:h-72 sm:w-72 dark:bg-blue-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.10),transparent_45%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-275 px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          {/* FORM */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="order-1"
          >
            <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 dark:border-white/10 dark:bg-slate-900/55">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-blue-700 dark:text-sky-300">
                    {copy.badgeTop}
                  </div>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {copy.title}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {copy.noAccount}{" "}
                    <Link href="/register" className="font-semibold text-blue-700 hover:underline dark:text-sky-300">
                      {copy.register}
                    </Link>
                  </p>
                </div>

                <div className="hidden sm:block">
                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 ring-1 ring-blue-200/60 dark:bg-slate-950/40 dark:text-sky-200 dark:ring-white/10">
                    {copy.secure}
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:gap-4">
                <Field label={copy.email} icon={<MailIcon className="h-5 w-5" />}>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy.emailPh}
                    className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                    autoComplete="email"
                    inputMode="email"
                  />
                </Field>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{copy.password}</span>
                  <div
                    className={cn(
                      "group flex items-center gap-2 rounded-2xl border px-3 py-3.5 transition",
                      "border-slate-200 bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-200/60",
                      "dark:border-white/10 dark:bg-slate-950/40 dark:focus-within:border-sky-500/50 dark:focus-within:ring-sky-900/40"
                    )}
                  >
                    <span className="text-slate-400 transition group-focus-within:text-blue-600 dark:group-focus-within:text-sky-300">
                      <LockIcon className="h-5 w-5" />
                    </span>

                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={copy.passwordPh}
                      type={showPw ? "text" : "password"}
                      className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition",
                        "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        "dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-950/60"
                      )}
                      aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPw ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 dark:border-white/20 dark:bg-slate-950"
                      />
                      {copy.remember}
                    </label>

                    <Link href="/forgot-password" className="text-xs font-semibold text-blue-700 hover:underline dark:text-sky-300">
                      {copy.forgot}
                    </Link>
                  </div>
                </label>

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                    >
                      {error}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={canSubmit ? { y: -1 } : undefined}
                  whileTap={canSubmit ? { scale: 0.985 } : undefined}
                  className={cn(
                    "mt-1 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition",
                    canSubmit
                      ? "bg-blue-600 text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-blue-700 active:bg-blue-800 dark:bg-sky-500 dark:hover:bg-sky-400 dark:active:bg-sky-300"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-white/10 dark:text-slate-400"
                  )}
                >
                  {loading ? copy.logging : copy.loginBtn}
                </motion.button>

                <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {copy.kvkkText1}{" "}
                  <Link className="font-semibold text-blue-700 hover:underline dark:text-sky-300" href="/kvkk">
                    {copy.kvkk}
                  </Link>{" "}
                  {copy.kvkkText2}{" "}
                  <Link className="font-semibold text-blue-700 hover:underline dark:text-sky-300" href="/cerez-politikasi">
                    {copy.cookies}
                  </Link>{" "}
                  {copy.kvkkText3}
                </p>
              </form>
            </div>

            <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
              {copy.footer} {new Date().getFullYear()} {copy.brand}
            </div>
          </motion.section>

          {/* INFO */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.06 }}
            className="order-2"
          >
            <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-7 dark:border-white/10 dark:bg-slate-900/45">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{copy.quickTitle}</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.quickDesc}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoCard title={copy.i1t} desc={copy.i1d} />
                <InfoCard title={copy.i2t} desc={copy.i2d} />
                <InfoCard title={copy.i3t} desc={copy.i3d} />
                <InfoCard title={copy.i4t} desc={copy.i4d} />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:bg-slate-950/40 dark:ring-white/10">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{copy.noteT}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{copy.noteD}</div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
