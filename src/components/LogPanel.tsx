import { useState } from 'react';

import './LogPanel.scss';

export default function LogPanel(props: {
  logs: string[],
  onClear: () => void
}) {
  const [logsCollapsed, setLogsCollapsed] = useState(true);

  return (
    <>
      <button onClick={() => setLogsCollapsed(!logsCollapsed)}>
        {logsCollapsed ? 'Expand' : 'Collapse'} Logs
      </button>
      {!logsCollapsed &&
        <>
          <button onClick={props.onClear}>Clear Logs</button>
          <ul className="log-panel">
            {props.logs.map((log, index) => (
              <li key={`log_${index}`}>{log}</li>
            ))}
          </ul>
        </>
      }
    </>
  )
}
