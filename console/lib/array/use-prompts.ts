import { trpc } from "../utils";

export default function usePrompts() {
  const { data: prompts, refetch } = trpc.getPrompts.useQuery();
  // TODO: Optimistic updates, invalidation
  trpc.onPrompt.useSubscription(undefined, { onData: () => refetch() });

  return {
    prompts,
  };
}
