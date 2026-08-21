import React, { useState } from 'react';
import { useAuth, TECH_AREAS_OPTIONS } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginUser, registerUser, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [techArea, setTechArea] = useState<string>(TECH_AREAS_OPTIONS[2]); // Fullstack default
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleResetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    handleResetForm();
    setMode(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg('Preencha o e-mail e a senha.');
        return;
      }
      const res = loginUser(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Falha ao efetuar login.');
      }
    } else if (mode === 'register') {
      if (!name.trim() || !email.trim() || !phone.trim() || !password) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas digitadas não coincidem.');
        return;
      }

      const res = registerUser({
        name,
        email,
        phone,
        techArea,
        password,
      });

      if (res.success) {
        setSuccessMsg('Cadastro realizado com sucesso! Você já está logado.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Erro ao realizar cadastro.');
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !password) {
        setErrorMsg('Preencha seu e-mail e a nova senha.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');
        return;
      }
      const res = resetPassword(email, password);
      if (res.success) {
        setSuccessMsg('Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.');
        setTimeout(() => {
          switchMode('login');
        }, 1800);
      } else {
        setErrorMsg(res.message || 'Não foi possível redefinir a senha.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 mb-1">
            <Flame className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Entrar no SprintForge'}
            {mode === 'register' && 'Criar Conta no SprintForge'}
            {mode === 'forgot' && 'Redefinição de Senha'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === 'login' && 'Acesse seus projetos, gerencie tarefas e colabore em tempo real.'}
            {mode === 'register' && 'Junte-se à plataforma agile e participe de equipes de alto desempenho.'}
            {mode === 'forgot' && 'Informe seu e-mail cadastrado para definir uma nova senha de acesso.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço de E-mail *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@sprintforge.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Celular *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Área Tecnológica em que Atua *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <select
                    value={techArea}
                    onChange={(e) => setTechArea(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                  >
                    {TECH_AREAS_OPTIONS.map((area) => (
                      <option key={area} value={area} className="bg-slate-900 text-white">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {mode !== 'forgot' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Senha de Acesso *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-purple-400 hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha *</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Senha *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'login' && (
              <>
                <span>Acessar Conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
            {mode === 'register' && (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Finalizar Cadastro</span>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Salvar Nova Senha</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Ainda não possui uma conta?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-purple-400 font-bold hover:underline"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          ) : (
            <p>
              Já possui cadastro?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-purple-400 font-bold hover:underline"
              >
                Faça login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
