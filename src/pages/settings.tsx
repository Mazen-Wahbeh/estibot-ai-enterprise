import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SaasHeader } from "@/components/SaasHeader";
import { fetchTenantSettings, saveTenantSettings, type TenantSettings } from "@/services/apiClient";

const currencies = ["USD", "SAR", "AED", "QAR", "KWD", "JOD", "EGP", "EUR", "GBP"];
const countries = ["GLOBAL", "SA", "AE", "QA", "KW", "JO", "EG", "US", "GB", "EU"];
const residencies = ["GLOBAL", "GCC", "EU", "US"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantSettings()
      .then((payload) => setSettings(payload.settings))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load settings."));
  }, []);

  const update = (field: keyof TenantSettings, value: string | number) => {
    setSettings((current) => (current ? { ...current, [field]: value } : current));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const payload = await saveTenantSettings({
        name: settings.name,
        locale: settings.locale,
        currency: settings.currency,
        country: settings.country,
        dataResidency: settings.dataResidency,
        vatRate: settings.vatRate,
        reportBrand: settings.reportBrand
      });
      setSettings(payload.settings);
      setMessage("Settings saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save settings.");
    }
  };

  return (
    <>
      <Head>
        <title>Settings | EstiBot AI SaaS</title>
      </Head>
      <RequireAuth>
        <SaasHeader />
        <main className="min-h-screen bg-panel px-4 py-6 text-ink">
          <form onSubmit={onSubmit} className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Market & Compliance Settings</h1>
            <p className="mt-2 text-sm text-accent-600">Configure localization, report branding, VAT, and data-residency posture for this tenant.</p>
            {settings ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold">
                  Tenant name
                  <input value={settings.name} onChange={(event) => update("name", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500" />
                </label>
                <label className="text-sm font-semibold">
                  Report brand
                  <input value={settings.reportBrand} onChange={(event) => update("reportBrand", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500" />
                </label>
                <label className="text-sm font-semibold">
                  Locale
                  <select value={settings.locale} onChange={(event) => update("locale", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500">
                    <option value="en">English</option>
                    <option value="ar">Arabic / RTL-ready</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Country
                  <select value={settings.country} onChange={(event) => update("country", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500">
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Currency
                  <select value={settings.currency} onChange={(event) => update("currency", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500">
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  VAT %
                  <input type="number" value={settings.vatRate} onChange={(event) => update("vatRate", Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500" min={0} max={100} />
                </label>
                <label className="text-sm font-semibold md:col-span-2">
                  Data residency
                  <select value={settings.dataResidency} onChange={(event) => update("dataResidency", event.target.value)} className="mt-2 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none focus:border-accent-500">
                    {residencies.map((residency) => (
                      <option key={residency} value={residency}>
                        {residency}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <p className="mt-6 text-sm text-accent-600">Loading settings...</p>
            )}
            {message ? <p className="mt-4 rounded-md bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-md bg-panel px-3 py-2 text-sm text-accent-700">{error}</p> : null}
            <button type="submit" className="mt-6 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white">
              Save settings
            </button>
          </form>
        </main>
      </RequireAuth>
    </>
  );
}
