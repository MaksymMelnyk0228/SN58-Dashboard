import { useState } from 'react';
import type { Miner } from '@sn58/shared';
import type { MinerPayload } from '../../api/miners';
import { Button } from '../ui/Button';
import { FilterDropdown } from '../ui/FilterDropdown';
import { Input } from '../ui/Input';

interface MinerFormProps {
  initial?: Miner;
  submitting?: boolean;
  onSubmit: (payload: MinerPayload) => void;
  onCancel: () => void;
}

interface FormErrors {
  uid?: string;
  hotkey?: string;
  score?: string;
  emissions?: string;
}

function validate(payload: MinerPayload): FormErrors {
  const errors: FormErrors = {};
  if (!Number.isInteger(payload.uid) || payload.uid < 0) {
    errors.uid = 'UID must be a non-negative integer';
  }
  if (!/^5[A-Za-z0-9]{7,}$/.test(payload.hotkey)) {
    errors.hotkey = 'Use a demo hotkey starting with 5';
  }
  if (payload.score < 0 || payload.score > 1) {
    errors.score = 'Score must be between 0 and 1';
  }
  if (payload.emissions < 0) {
    errors.emissions = 'Emissions cannot be negative';
  }
  return errors;
}

export function MinerForm({ initial, submitting, onSubmit, onCancel }: MinerFormProps) {
  const [uid, setUid] = useState(initial?.uid.toString() ?? '');
  const [hotkey, setHotkey] = useState(initial?.hotkey ?? '5FakeMin');
  const [score, setScore] = useState(initial?.score.toString() ?? '0.5');
  const [rank, setRank] = useState(initial?.rank.toString() ?? '');
  const [emissions, setEmissions] = useState(initial?.emissions.toString() ?? '0.01');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [errors, setErrors] = useState<FormErrors>({});

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const payload: MinerPayload = {
          uid: Number(uid),
          hotkey: hotkey.trim(),
          score: Number(score),
          emissions: Number(emissions),
          status: status as MinerPayload['status'],
        };
        if (rank) {
          payload.rank = Number(rank);
        }
        const nextErrors = validate(payload);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {
          onSubmit(payload);
        }
      }}
    >
      <div className="form-grid">
        <Input label="UID" name="uid" value={uid} onChange={(e) => setUid(e.target.value)} error={errors.uid} />
        <Input
          label="Hotkey"
          name="hotkey"
          value={hotkey}
          onChange={(e) => setHotkey(e.target.value)}
          error={errors.hotkey}
        />
        <Input
          label="Score"
          name="score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          error={errors.score}
        />
        <Input label="Rank" name="rank" value={rank} onChange={(e) => setRank(e.target.value)} />
        <Input
          label="Emissions"
          name="emissions"
          value={emissions}
          onChange={(e) => setEmissions(e.target.value)}
          error={errors.emissions}
        />
        <FilterDropdown
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as MinerPayload['status'])}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'jailed', label: 'Jailed' },
          ]}
        />
      </div>
      <div className="modal-actions" style={{ marginTop: 16 }}>
        <Button type="submit" disabled={submitting}>
          {initial ? 'Save changes' : 'Create miner'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
