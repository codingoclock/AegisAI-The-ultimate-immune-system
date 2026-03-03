export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-xs text-slate-400 md:text-sm">
          Configure AegisAI integration points, API keys, and RBAC policies.
        </p>
      </div>
      <div className="glass-panel flex flex-1 items-center justify-center px-4 py-4 text-xs text-slate-400">
        <p className="max-w-md text-center">
          Add forms here for configuring FastAPI endpoints, authentication
          providers, alerting destinations, and role mappings once your backend
          contracts are finalized.
        </p>
      </div>
    </div>
  );
}

