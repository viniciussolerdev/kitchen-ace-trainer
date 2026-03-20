import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, UserCog, Trash2, Mail } from "lucide-react";

const Professionals = () => {
  const { salonId } = useAuth();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteProfessionalId, setInviteProfessionalId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCommission, setFormCommission] = useState("30");

  useEffect(() => {
    if (salonId) fetchProfessionals();
  }, [salonId]);

  const fetchProfessionals = async () => {
    if (!salonId) return;
    const { data } = await supabase
      .from("professionals")
      .select("*")
      .eq("salon_id", salonId)
      .order("name");
    setProfessionals(data || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) return;
    setLoading(true);

    const { error } = await supabase.from("professionals").insert({
      salon_id: salonId,
      name: formName,
      phone: formPhone || null,
      email: formEmail || null,
      commission_rate: parseFloat(formCommission),
    });

    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Profissional adicionado!");
      setDialogOpen(false);
      setFormName(""); setFormPhone(""); setFormEmail(""); setFormCommission("30");
      fetchProfessionals();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("professionals").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir: " + error.message);
    else { toast.success("Profissional excluído!"); fetchProfessionals(); }
  };

  const openInviteDialog = (pro: any) => {
    setInviteProfessionalId(pro.id);
    setInviteEmail(pro.email || "");
    setInvitePassword("");
    setInviteDialogOpen(true);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId || !inviteProfessionalId) return;
    setInviteLoading(true);

    const pro = professionals.find((p) => p.id === inviteProfessionalId);

    const { data, error } = await supabase.functions.invoke("invite-employee", {
      body: {
        email: inviteEmail,
        password: invitePassword,
        fullName: pro?.name || "Funcionário",
        professionalId: inviteProfessionalId,
        salonId,
      },
    });

    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Erro ao criar conta");
    } else {
      toast.success("Conta de acesso criada com sucesso!");
      setInviteDialogOpen(false);
      fetchProfessionals();
    }
    setInviteLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground text-sm mt-1">{professionals.length} profissionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Profissional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Profissional</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Comissão (%)</Label>
                <Input type="number" min="0" max="100" step="0.5" value={formCommission} onChange={(e) => setFormCommission(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto no-scrollbar">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Acesso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <UserCog className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum profissional cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                professionals.map((pro) => (
                  <TableRow key={pro.id}>
                    <TableCell className="font-medium">{pro.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{pro.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{pro.email || "—"}</TableCell>
                    <TableCell className="font-sans">{Number(pro.commission_rate).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={pro.is_active ? "default" : "secondary"}>
                        {pro.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {pro.profile_id ? (
                        <Badge variant="outline" className="text-success border-success/30">
                          Possui acesso
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openInviteDialog(pro)}
                          className="text-xs"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Criar acesso
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir profissional?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(pro.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Employee Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Acesso para Funcionário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O funcionário poderá acessar o sistema com as credenciais abaixo, visualizando apenas sua própria agenda e comissões.
          </p>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail de acesso</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Senha temporária</Label>
              <Input type="text" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
            <Button type="submit" className="w-full" disabled={inviteLoading}>
              {inviteLoading ? "Criando..." : "Criar Conta de Acesso"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Professionals;
