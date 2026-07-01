export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="state-box">
      <strong>{title}</strong>
      {detail ? <p className="muted">{detail}</p> : null}
    </div>
  );
}
