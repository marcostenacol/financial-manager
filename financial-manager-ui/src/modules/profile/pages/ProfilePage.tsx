import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/useAuth';
import { useProfile } from '../hooks/useProfile';
import { User, Mail, Shield, Save, UserCircle, Camera, KeyRound } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { getProfile, updateProfile, changeProfileType, updateAvatar } = useProfile();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [type, setType] = useState('personal');
  const [savedType, setSavedType] = useState('personal');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name || '');
        setBio(profile.bio || '');
        setType(profile.type || 'personal');
        setSavedType(profile.type || 'personal');
        if (profile.avatar) {
          setAvatar(getAvatarUrl(profile.avatar));

          if (user.avatar !== profile.avatar) {
            updateUser({ ...user, avatar: profile.avatar });
          }
        }
      } catch (err) {
        showToast(getErrorMessage(err, 'Erro ao carregar perfil'), 'error');
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({ name, bio });
      let updatedUser = { ...user!, name, bio };

      if (type !== savedType) {
        const updatedProfile = await changeProfileType(type as 'personal' | 'business');
        updatedUser = { ...updatedUser, type: updatedProfile.type };
        setSavedType(updatedProfile.type);
      }

      if (avatarFile) {
        const updatedProfile = await updateAvatar(avatarFile);
        updatedUser = { ...updatedUser, avatar: updatedProfile.avatar ?? undefined };
      }

      updateUser(updatedUser);
      setSuccess(true);
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao atualizar perfil'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-app-accent/20 rounded-2xl border border-app-accent/30">
            <UserCircle className="w-8 h-8 text-app-accent" />
          </div>
          <div>
            <h1 className="ledger-title text-4xl text-app-ink">Meu Perfil</h1>
            <p className="text-app-muted">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-app-surface-2 backdrop-blur-xl border border-app-border rounded-3xl p-8 shadow-2xl">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-2 border-app-border overflow-hidden bg-app-surface flex items-center justify-center relative">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-app-muted" />
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-app-ink mb-1" />
                    <span className="text-[10px] text-app-ink font-bold uppercase tracking-wider">Alterar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-app-accent rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-lg">
                  <Camera className="w-3.5 h-3.5 text-app-ink" />
                </div>
              </div>
              <p className="text-xs text-app-muted mt-4 uppercase tracking-widest font-bold">Foto do Perfil</p>
            </div>

            <div className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-app-surface border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 focus:border-app-accent/50 transition-all"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">Biografia</label>
                <div className="relative group">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-app-surface border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 focus:border-app-accent/50 transition-all resize-none h-24"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </div>

              {/* E-mail (Read Only) */}
              <div className="space-y-2 opacity-60">
                <label className="text-sm font-medium text-app-muted ml-1">E-mail (Não alterável)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-app-surface border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Tipo de Perfil */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">Tipo de Conta</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('personal')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      type === 'personal' 
                        ? 'bg-app-accent/20 border-app-accent text-app-ink shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                        : 'bg-app-surface-2 border-app-border text-app-muted hover:bg-app-surface-2'
                    }`}
                  >
                    <User className="w-6 h-6" />
                    <span className="font-medium">Pessoal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('business')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      type === 'business' 
                        ? 'bg-app-accent/20 border-app-accent text-app-ink shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'bg-app-surface-2 border-app-border text-app-muted hover:bg-app-surface-2'
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                    <span className="font-medium">Empresarial</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-app-border text-app-ink/80 hover:bg-app-surface-2 transition-all font-medium"
              >
                <KeyRound className="w-5 h-5" />
                Trocar Senha
              </button>
            </div>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl text-center font-medium"
              >
                Perfil atualizado com sucesso!
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-app-accent to-app-accent hover:from-app-accent hover:to-app-accent text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-center">
          <button
            onClick={signOut}
            className="text-app-muted hover:text-red-400 font-medium transition-colors p-2"
          >
            Sair da conta
          </button>
        </div>
      </motion.div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
