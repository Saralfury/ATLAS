export function ErrorState({ errorType, onRetry }: { errorType: "port-not-found" | "simulation-fault" | "backend-offline"; onRetry?: () => void }) {
  const label =
    errorType === "backend-offline"
      ? "BACKEND OFFLINE - CHECK localhost:8000"
      : errorType === "port-not-found"
        ? "PORT NOT FOUND IN NETWORK"
        : "SIMULATION ENGINE FAULT - RETRY";
  return (
    <div className={`error-state ${errorType}`}>
      <span>{label}</span>
      {onRetry ? <button onClick={onRetry}>RETRY</button> : null}
    </div>
  );
}
