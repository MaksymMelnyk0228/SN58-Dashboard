import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCandidateKey } from '../../api/assessment';
import { getApiErrorMessage } from '../../api/client';
import { Button } from '../ui/Button';

export function CandidateKeyCard() {
  const [copied, setCopied] = useState(false);
  const query = useQuery({
    queryKey: ['candidate-key'],
    queryFn: getCandidateKey,
  });

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="login-card candidate-key-card" aria-labelledby="candidate-key-title">
      <h2 id="candidate-key-title">Your candidate key</h2>
      <p className="muted">
        Send this unique key to the interviewer to register on the shortlist. Do not share it with
        other candidates.
      </p>
      {query.isLoading ? <p className="muted">Loading candidate key…</p> : null}
      {query.isError ? (
        <p className="field-error">
          {getApiErrorMessage(query.error, 'Unable to load your candidate key. Start the API with npm run dev.')}
        </p>
      ) : null}
      {query.data ? (
        <div className="candidate-key-row">
          <code className="candidate-key-value">{query.data.key}</code>
          <Button type="button" variant="secondary" size="sm" onClick={() => void copyKey(query.data.key)}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
