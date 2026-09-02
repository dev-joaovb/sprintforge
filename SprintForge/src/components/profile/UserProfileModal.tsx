import React, { useState } from 'react';
import { useAuth, TECH_AREAS_OPTIONS } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Award,
  FileText,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck,
  Edit2,
  Save,
  LogOut,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, logoutUser } = useAuth();
  const { myProjects, completedProjects, tasks, downloadProjectPdf } = useProject();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [techArea, setTechArea] = useState(currentUser?.techArea || TECH_AREAS_OPTIONS[0]);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0]);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      techArea,
      avatarUrl: avatarUrl.trim(),
    });
    setIsEditing(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    onClose();
    logoutUser();
  };

  // Calculations
  const userCompletedTasks = tasks.filter(
    (t) => t.status === 'done' && t.assignees.includes(currentUser.id)
  ).length;

  const userAdminProjects = myProjects.filter((p) => p.adminId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Top Actions: Close & Logout */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Meu Perfil Profissional</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Sair do Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Login</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-500/20">
              <img
                src={
                  currentUser.avatarUrl ||
                  `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
                }
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-500 text-slate-950 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{currentUser.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Perfil Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-slate-300">{currentUser.techArea}</span>
            </p>
            <p className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-3 pt-1">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {currentUser.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Membro desde {currentUser.createdAt}</span>
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => {
                setName(currentUser.name);
                setPhone(currentUser.phone);
                setTechArea(currentUser.techArea);
                setIsEditing(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5 text-purple-400" /> Editar Perfil
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold shrink-0"
            >
              Cancelar
            </button>
          )}
        </div>

        {isSavedNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Perfil atualizado com sucesso!</span>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Atualizar Informações do Perfil
            </h3>

            <div className="space-y-3 pt-1 border-b border-slate-800 pb-3">
              <label className="block text-[11px] font-semibold text-slate-300">Foto de Perfil</label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="Prévia da foto"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-purple-500 shadow-md shrink-0"
                />
                
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Cole a URL da sua foto (https://...)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                    
                    <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">Ou escolha um avatar:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                            avatarUrl === preset ? 'border-purple-500 scale-110 shadow-md shadow-purple-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Celular / Telefone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Área Tecnológica de Atuação</label>
                <select
                  value={techArea}
                  onChange={(e) => setTechArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {TECH_AREAS_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{completedProjects.length}</div>
              <div className="text-[11px] font-semibold text-slate-400">Projetos Concluídos</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{userAdminProjects.length}</div>
              <div className="text-[11px] font-semibold text-slate-400">Como Administrador</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{userCompletedTasks}</div>
              <div className="text-[11px] font-semibold text-slate-400">Tarefas Entregues</div>
            </div>
          </div>
        </div>

        {/* Concluded Projects List with PDF Report Download */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-400" /> Histórico de Projetos Concluídos ({completedProjects.length})</span>
          </h3>

          {completedProjects.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl space-y-1 bg-slate-950/40">
              <span className="text-xs font-bold text-slate-400 block">Nenhum projeto concluído ainda</span>
              <p className="text-[11px] text-slate-500">
                Quando você ou a equipe finalizarem um projeto no sistema, ele aparecerá aqui com seu relatório em PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {completedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{proj.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        CONCLUÍDO
                      </span>
                      <span className="text-[10px] text-slate-500">Metodologia: {proj.activeMethodology}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{proj.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>Admin: {proj.adminName}</span>
                      <span>• Data Conclusão: {proj.completedAt || 'Recentemente'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadProjectPdf(proj.id)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Logout Option */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sair do Login
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
