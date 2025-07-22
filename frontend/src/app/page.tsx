"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-8 gap-12">
      <header className="flex flex-col items-center gap-2">
        <Image src="./next.svg" alt="Logo" width={180} height={38} priority />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-center">Canadian Voting Trends: Generational, Campus, and Immigration</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Explore Canadian voter turnout by generation, campus, and immigration status. Choose a feature below to get started.
        </p>
      </header>
      <main className="flex flex-col gap-6 w-full max-w-md">
        <button
          className="w-full py-4 px-6 rounded-lg bg-blue-600 text-white text-xl font-semibold shadow hover:bg-blue-700 transition flex items-center justify-center"
          onClick={async () => {
            setLoading('dashboard');
            await router.push('/turnout-dashboard');
          }}
          disabled={loading !== null}
        >
          Generational Voting Trends
          {loading === 'dashboard' && (
            <span className="ml-3 animate-spin" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
          )}
        </button>
        <button
          className="w-full py-4 px-6 rounded-lg bg-green-600 text-white text-xl font-semibold shadow hover:bg-green-700 transition flex items-center justify-center"
          onClick={async () => {
            setLoading('campus');
            await router.push('/on-campus-voting');
          }}
          disabled={loading !== null}
        >
          On Campus Voting
          {loading === 'campus' && (
            <span className="ml-3 animate-spin" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
          )}
        </button>
        <button className="w-full py-4 px-6 rounded-lg bg-purple-600 text-white text-xl font-semibold shadow hover:bg-purple-700 transition flex items-center justify-center"
          onClick={async () => {
            setLoading('immigration');
            await router.push('/ImmigrationTurnoutPage');
          }}
          disabled={loading !== null}
        >
          Immigration and Voting Patterns
          {loading === 'immigration' && (
            <span className="ml-3 animate-spin" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </span>
          )}
        </button>
      </main>
    </div>
  );
}
