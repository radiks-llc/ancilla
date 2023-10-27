"use client";

import useArrayClient from "@/lib/array/use-client";
import { useEffect, useState } from "react";

export default function ConnectionIndicator() {
  const client = useArrayClient();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setIsConnected(client.isConnected),
      1000
    );
    return () => clearInterval(interval);
  }, [client.isConnected]);

  return (
    <div className="absolute top-0 right-0 m-4">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <div>Connected</div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <div>Disconnected</div>
        </div>
      )}
    </div>
  );
}
