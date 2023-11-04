import { PromptForm } from "@/components/array/promptForm";
import PromptList from "@/components/array/promptList";

export default function Home() {
  return (
    <main className="flex flex-col p-24 items-center">
      <div className="flex flex-col gap-4">
        Ancilla demo
        <PromptForm />
        <PromptList />
      </div>
    </main>
  );
}
