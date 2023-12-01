import { PromptForm } from "@/components/array/promptForm";
import PromptList from "@/components/array/promptList";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 overflow-auto">
        <nav className="flex flex-col p-4">
          <h3 className="text-xl font-semibold mb-4">Services</h3>
          <Link
            className="mb-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="#"
          >
            Service 1
          </Link>
          <Link
            className="mb-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="#"
          >
            Service 2
          </Link>
          <Link
            className="mb-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="#"
          >
            Service 3
          </Link>
          <Link
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="#"
          >
            Service 4
          </Link>
        </nav>
      </aside>
      <PromptForm />
      <PromptList />
    </main>
  );
}
