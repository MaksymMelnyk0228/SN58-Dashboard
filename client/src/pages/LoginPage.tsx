import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DEMO_NOTICE } from '@sn58/shared';
import { getApiErrorMessage } from '../api/client';
import { CandidateKeyCard } from '../components/auth/CandidateKeyCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@example.com');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-stack">
        <CandidateKeyCard />
        <form
          className="login-card"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setSubmitting(true);
            try {
              if (mode === 'login') {
                await login(email, password);
              } else {
                await register(email, name, password);
              }
            } catch (err) {
              setError(getApiErrorMessage(err, 'Unable to authenticate'));
            } finally {
              setSubmitting(false);
            }
          }}
        >
        <div>
          <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p className="muted">{DEMO_NOTICE}</p>
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode === 'register' ? (
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        ) : null}
        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="field-error">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </Button>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            Development-only seed user: admin@example.com / ChangeMe123!
          </p>
        </form>
      </div>
    </div>
  );
}
