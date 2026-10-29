import React, { useState } from 'react';
import { useAuth, TECH_AREAS_OPTIONS } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Mail,
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

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10';

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50';

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

  const userCompletedTasks = tasks.filter(
    (t) => t.status === 'done' && t.assignees.includes(currentUser.id)
  ).length;

  const userAdminProjects = myProjects.filter((p) => p.adminId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-modal-title"
        className="relative my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 id="user-profile-modal-title" className="text-base font-bold text-slate-900 sm:text-lg">
              Meu Perfil Profissional
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Informações, conquistas e histórico de projetos</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
              title="Sair do Login"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair do Login</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar perfil"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50/60 p-5 sm:p-7">
          {/* Identity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatarUrl || PRESET_AVATARS[0]}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-2xl border-2 border-blue-100 object-cover shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 rounded-lg border-2 border-white bg-emerald-600 p-1.5 text-white shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h3 className="break-words text-xl font-bold tracking-tight text-slate-900">{currentUser.name}</h3>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Perfil Verificado
                  </span>
                </div>
                <p className="flex items-center justify-center gap-1.5 text-sm text-slate-600 sm:justify-start">
                  <Briefcase className="h-4 w-4 shrink-0 text-blue-600" />
                  <span className="font-medium">{currentUser.techArea}</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:justify-start">
                  <span className="flex min-w-0 items-center gap-1.5 break-all">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Membro desde {currentUser.createdAt}
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setName(currentUser.name);
                    setPhone(currentUser.phone);
                    setTechArea(currentUser.techArea);
                    setIsEditing(true);
                  }}
                  className={`${secondaryButtonClass} shrink-0`}
                >
                  <Edit2 className="h-4 w-4 text-blue-600" /> Editar Perfil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`${secondaryButtonClass} shrink-0`}
                >
                  Cancelar
                </button>
              )}
            </div>
          </section>

          {isSavedNotice && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-blue-600" /> Atualizar Informações do Perfil
              </h3>

              <div className="space-y-3 border-b border-slate-200 pb-5">
                <label className="block text-xs font-semibold text-slate-700">Foto de Perfil</label>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <img
                    src={avatarUrl || PRESET_AVATARS[0]}
                    alt="Prévia da foto"
                    className="h-16 w-16 shrink-0 rounded-xl border-2 border-blue-200 object-cover"
                  />
                  <div className="w-full min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="url"
                        aria-label="URL da foto de perfil"
                        placeholder="Cole a URL da sua foto (https://...)"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className={`${fieldClass} min-w-0 flex-1`}
                      />
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        <Upload className="h-4 w-4 text-blue-600" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <span className="mb-2 block text-xs font-medium text-slate-500">Ou escolha um avatar:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {PRESET_AVATARS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Selecionar avatar ${idx + 1}`}
                            aria-pressed={avatarUrl === preset}
                            onClick={() => setAvatarUrl(preset)}
                            className={`h-10 w-10 overflow-hidden rounded-xl border-2 transition-all ${
                              avatarUrl === preset
                                ? 'border-blue-600 ring-2 ring-blue-600/20'
                                : 'border-slate-200 opacity-80 hover:border-blue-300 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-name" className="mb-2 block text-xs font-semibold text-slate-700">Nome Completo</label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="mb-2 block text-xs font-semibold text-slate-700">Celular / Telefone</label>
                  <input
                    id="profile-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="profile-tech-area" className="mb-2 block text-xs font-semibold text-slate-700">Área Tecnológica de Atuação</label>
                  <select
                    id="profile-tech-area"
                    value={techArea}
                    onChange={(e) => setTechArea(e.target.value)}
                    className={fieldClass}
                  >
                    {TECH_AREAS_OPTIONS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <Save className="h-4 w-4" /> Salvar Alterações
                </button>
              </div>
            </form>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{completedProjects.length}</div>
                <div className="text-xs font-medium text-slate-500">Projetos Concluídos</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-blue-700">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{userAdminProjects.length}</div>
                <div className="text-xs font-medium text-slate-500">Como Administrador</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-700">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{userCompletedTasks}</div>
                <div className="text-xs font-medium text-slate-500">Tarefas Entregues</div>
              </div>
            </div>
          </div>

          {/* Completed Projects */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="h-4 w-4 text-blue-600" />
              Histórico de Projetos Concluídos ({completedProjects.length})
            </h3>

            {completedProjects.length === 0 ? (
              <div className="space-y-2 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <span className="block text-sm font-semibold text-slate-700">Nenhum projeto concluído ainda</span>
                <p className="text-xs leading-relaxed text-slate-500">
                  Quando você ou a equipe finalizarem um projeto no sistema, ele aparecerá aqui com seu relatório em PDF.
                </p>
              </div>
            ) : (
              <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                {completedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-words text-sm font-bold text-slate-900">{proj.name}</span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          CONCLUÍDO
                        </span>
                        <span className="text-xs text-slate-500">Metodologia: {proj.activeMethodology}</span>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-600">{proj.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Admin: {proj.adminName}</span>
                        <span>Data Conclusão: {proj.completedAt || 'Recentemente'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadProjectPdf(proj.id)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4" /> Baixar PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" /> Sair do Login
            </button>
            <button type="button" onClick={onClose} className={secondaryButtonClass}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
