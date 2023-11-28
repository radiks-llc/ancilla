"use client";

export default function ConnectionIndicator() {
  return (
    <div className="absolute top-0 right-0 m-4">
      {true ? (
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
