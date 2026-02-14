import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const AdminProfilePage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || "");
    }
  }, [user]);

  const handleUpdateName = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    if (error) toast.error(error.message);
    else toast.success("Nom mis à jour");
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Mot de passe mis à jour");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-2xl">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        {/* Email (read-only) */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Email</label>
          <p className="text-foreground">{user?.email}</p>
        </div>

        {/* Display Name */}
        <div className="space-y-3">
          <h2 className="font-display text-lg">Nom d'affichage</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Votre nom"
            className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleUpdateName}
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={14} /> {saving ? "Saving…" : "Enregistrer"}
          </button>
        </div>

        {/* Password */}
        <div className="space-y-3 border-t border-border pt-8">
          <h2 className="font-display text-lg">Changer le mot de passe</h2>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleUpdatePassword}
            disabled={saving || !newPassword}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={14} /> {saving ? "Saving…" : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
