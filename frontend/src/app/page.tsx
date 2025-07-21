"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-8 gap-12">
      <header className="flex flex-col items-center gap-2">
        <Image src="/next.svg" alt="Logo" width={180} height={38} priority />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-center">Elections Canada Campus Voting</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Explore Canadian post-secondary voter turnout and more. Choose a feature below to get started.
        </p>
      </header>
      <main className="flex flex-col gap-6 w-full max-w-md">
        <button
          className="w-full py-4 px-6 rounded-lg bg-blue-600 text-white text-xl font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => router.push('/turnout-dashboard')}
        >
          Generational Voting Trends
        </button>
        <button
          className="w-full py-4 px-6 rounded-lg bg-green-600 text-white text-xl font-semibold shadow hover:bg-green-700 transition"
          onClick={() => router.push('/on-campus-voting')}
        >
          On Campus Voting
        </button>
        <button className="w-full py-4 px-6 rounded-lg bg-purple-600 text-white text-xl font-semibold shadow hover:bg-purple-700 transition"
          onClick={() => router.push('/ImmigrationTurnoutPage')}
        >
          Immigration and Voting Patterns
        </button>
      </main>
      <footer className="mt-12 text-gray-400 text-sm">&copy; {new Date().getFullYear()} Elections Canada Campus Voting</footer>
    </div>
  );
}
