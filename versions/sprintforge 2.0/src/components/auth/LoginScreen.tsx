import React, { useState } from 'react';
import { useAuth, TECH_AREAS_OPTIONS, DEMO_USERS } from '../../context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUser, registerUser, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [techArea, setTechArea] = useState<string>(TECH_AREAS_OPTIONS[2]); // Fullstack
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    handleResetMessages();
    setMode(newMode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetMessages();

    if (!email.trim() || !password) {
      setErrorMsg('Informe o seu e-mail e sua senha de acesso.');
      return;
    }

    const res = loginUser(email, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Falha ao autenticar. Verifique suas credenciais.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetMessages();

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
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

    if (!res.success) {
      setErrorMsg(res.message || 'Erro ao criar conta.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetMessages();

    if (!email.trim() || !password) {
      setErrorMsg('Informe o e-mail cadastrado e a nova senha.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    const res = resetPassword(email, password);
    if (res.success) {
      setSuccessMsg('Senha alterada com sucesso! Você já pode entrar com a nova senha.');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Erro ao redefinir senha.');
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoPass: string = '123') => {
    handleResetMessages();
    setEmail(demoEmail);
    setPassword(demoPass);
    loginUser(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambience Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Zone */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
                SprintForge
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Agile Engineering & Management
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-cyan-400" /> XP Engine</span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5 text-purple-400" /> Scrum Sprints</span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5"><KanbanIcon className="w-3.5 h-3.5 text-emerald-400" /> Kanban Flow</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Brand Welcome Text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Acesso Seguro & Isolado
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === 'login' && 'Entrar na Plataforma'}
              {mode === 'register' && 'Criar Nova Conta'}
              {mode === 'forgot' && 'Recuperação de Senha'}
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {mode === 'login' && 'Gerencie seus projetos ágeis, sprints, TDD e pareamentos com isolamento total.'}
              {mode === 'register' && 'Cadastre-se para criar seus projetos ou participar de times convidados.'}
              {mode === 'forgot' && 'Digite seu e-mail cadastrado para definir uma nova senha de acesso.'}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Mode Selector Tabs (Login / Register) */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cadastrar
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">Senha</label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Acessar Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Costa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">E-mail Profissional</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="mariana@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">WhatsApp / Telefone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Área de Atuação Tecnológica</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={techArea}
                      onChange={(e) => setTechArea(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      {TECH_AREAS_OPTIONS.map((area) => (
                        <option key={area} value={area} className="bg-slate-900 text-white">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Mín. 4 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Confirmar</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cadastrar e Acessar</span>
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Voltar ao Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30"
                  >
                    Redefinir Senha
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Acesso Rápido para Demonstração
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_USERS.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(u.email)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {u.techArea}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Zone */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SprintForge • Plataforma de Gestão Ágil Multi-Metodologias</span>
          <span>XP (Extreme Programming) • Scrum Sprints • Kanban Contínuo</span>
        </div>
      </footer>

    </div>
  );
};
