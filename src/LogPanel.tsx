import './LogPanel.scss';
export function LogPanel(props: { logs: string[] }) {
  return (
    <ul className="log-panel">
      {props.logs.map((log, index) => (
        <li key={`log_${index}`}>{log}</li>
      ))}
    </ul>
  )
}
