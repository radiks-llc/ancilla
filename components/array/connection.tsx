"use client";

import { ArrayClient } from "@/lib/array/client";
import { EventTypes, MessageTypes } from "@cli/types";
import React, { useRef } from "react";
import { useEffect, useState } from "react";

export const ArrayContext = React.createContext<ArrayClient>(null!);

export const ArrayProvider = ({ children }: { children: React.ReactNode }) => {
  const recievedHeartbeat = useRef(true);
  const [client, setClient] = useState<ArrayClient>(new ArrayClient());

  useEffect(() => {
    if (client) {
      client.addHandler(EventTypes.Heartbeat, () => {
        recievedHeartbeat.current = true;
      });

      const heartbeat = () => {
        if (!recievedHeartbeat.current) setClient(new ArrayClient());
        recievedHeartbeat.current = false;
        client.send({
          type: MessageTypes.Event,
          event: EventTypes.Heartbeat,
        });
      };

      const interval = setInterval(heartbeat, 10000);
      return () => clearInterval(interval);
    } else {
      setClient(new ArrayClient());
    }
  }, [client]);

  return (
    <ArrayContext.Provider value={client}>{children}</ArrayContext.Provider>
  );
};
