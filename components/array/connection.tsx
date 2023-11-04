"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, wsLink } from "@trpc/client";
import { Store, useStore } from "@/lib/stores";
import React, { useState } from "react";
import { trpc } from "@/lib/utils";

export const ArrayContext = React.createContext<Store>(null!);

export const ArrayProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useStore();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(
    trpc.createClient({
      links: [
        wsLink({
          client: createWSClient({
            url: "ws://localhost:12343/",
          }),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ArrayContext.Provider value={store}>{children}</ArrayContext.Provider>
      </trpc.Provider>
    </QueryClientProvider>
  );
};
