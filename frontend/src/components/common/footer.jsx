function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 text-center lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight text-[#07111f]">
          Finance<span className="text-emerald-500">AI</span>
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Intelligent financial planning, insights and risk awareness.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <button className="transition hover:text-[#07111f]">
            About
          </button>

          <button className="transition hover:text-[#07111f]">
            Privacy
          </button>

          <button className="transition hover:text-[#07111f]">
            Terms
          </button>

          <button className="transition hover:text-[#07111f]">
            Support
          </button>

          <button className="transition hover:text-[#07111f]">
            API Docs
          </button>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Status text="Market Live" />
          <Status text="AI Online" />
          <Status text="AML Active" />
        </div>

        <p className="mx-auto mt-7 max-w-3xl text-xs leading-5 text-slate-400">
          FinanceAI provides algorithmic insights for educational purposes and
          is not a SEBI registered investment advisor.
        </p>

        <div className="mt-7 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-400">
            © 2026 FinanceAI · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Status({ text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {text}
    </span>
  );
}

export default Footer;