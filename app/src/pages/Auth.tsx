import { useState } from 'react';
import { IonContent, IonInput, IonSpinner, IonIcon } from '@ionic/react';
import { motion } from 'framer-motion';
import { mailOutline, lockClosedOutline, personOutline, checkmarkCircle } from 'ionicons/icons';
import { supabase, authErrorPt } from '../lib/supabase';
import './Auth.css';

type Mode = 'login' | 'register';

/** Tela de entrada — Login / Registro (Supabase Auth, email + senha). */
const Auth: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const valid = email.trim().includes('@') && pass.length >= 6 && (mode === 'login' || name.trim().length >= 2);

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true); setErr(''); setInfo('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
        if (error) setErr(authErrorPt(error.message));
        // sucesso: o onAuthStateChange no App troca pra tela do app
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: { data: { name: name.trim() } },
        });
        if (error) { setErr(authErrorPt(error.message)); }
        else if (!data.session) {
          // confirmação de email ligada no projeto
          setInfo('Conta criada! Enviamos um email de confirmação — confirme e depois entre.');
          setMode('login');
        }
        // se data.session existe, já entra (onAuthStateChange cuida)
      }
    } catch (e) {
      setErr(authErrorPt((e as Error)?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="auth-content" fullscreen>
      <div className="auth-fx" aria-hidden="true" />
      <div className="auth-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="auth-card"
        >
          <div className="auth-brand">
            HOME <span className="brand-hl">GYM</span>
          </div>
          <p className="auth-sub">
            {mode === 'login' ? 'Entre pra continuar seus treinos.' : 'Crie sua conta e comece a treinar.'}
          </p>

          <div className="auth-seg">
            <button className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr(''); setInfo(''); }}>
              Entrar
            </button>
            <button className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr(''); setInfo(''); }}>
              Criar conta
            </button>
          </div>

          {mode === 'register' && (
            <label className="auth-field">
              <IonIcon icon={personOutline} />
              <IonInput
                type="text" placeholder="Seu nome" autocapitalize="words"
                value={name} onIonInput={(e) => setName(e.detail.value || '')}
                aria-label="Nome"
              />
            </label>
          )}
          <label className="auth-field">
            <IonIcon icon={mailOutline} />
            <IonInput
              type="email" placeholder="Email" inputmode="email" autocomplete="email"
              value={email} onIonInput={(e) => setEmail(e.detail.value || '')}
              aria-label="Email"
            />
          </label>
          <label className="auth-field">
            <IonIcon icon={lockClosedOutline} />
            <IonInput
              type="password" placeholder="Senha (mín. 6)" autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={pass} onIonInput={(e) => setPass(e.detail.value || '')}
              aria-label="Senha"
            />
          </label>

          {err && <div className="auth-msg err">{err}</div>}
          {info && <div className="auth-msg ok"><IonIcon icon={checkmarkCircle} /> {info}</div>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="auth-go"
            disabled={!valid || loading}
            onClick={submit}
          >
            {loading ? <IonSpinner name="crescent" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </motion.button>

          <p className="auth-switch">
            {mode === 'login' ? (
              <>Não tem conta? <button onClick={() => { setMode('register'); setErr(''); setInfo(''); }}>Criar conta</button></>
            ) : (
              <>Já tem conta? <button onClick={() => { setMode('login'); setErr(''); setInfo(''); }}>Entrar</button></>
            )}
          </p>
        </motion.div>
      </div>
    </IonContent>
  );
};

export default Auth;
