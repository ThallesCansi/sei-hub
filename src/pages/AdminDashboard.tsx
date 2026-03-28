import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Clock, GitBranch, AlertTriangle, Building2, FileCheck } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminPostsTab from '@/components/admin/AdminPostsTab';
import AdminPendingPostsTab from '@/components/admin/AdminPendingPostsTab';
import AdminRevisionsTab from '@/components/admin/AdminRevisionsTab';
import AdminReportsTab from '@/components/admin/AdminReportsTab';
import AdminGraphManager from '@/components/AdminGraphManager';
import AdminInstitutionalTab from '@/components/admin/AdminInstitutionalTab';

export default function AdminDashboard() {
  const { profile } = useAuth();

  if (!profile?.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-heading font-bold mb-6">Painel Admin</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutDashboard className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="all-posts" className="gap-1.5">
            <FileText className="h-4 w-4" /> Todos os Posts
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-4 w-4" /> Pendentes
          </TabsTrigger>
          <TabsTrigger value="revisions" className="gap-1.5">
            <FileCheck className="h-4 w-4" /> Revisões
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Denúncias
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-1.5">
            <GitBranch className="h-4 w-4" /> Grafo
          </TabsTrigger>
          <TabsTrigger value="institutional" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Institucional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdminOverview /></TabsContent>
        <TabsContent value="users"><AdminUsersTab /></TabsContent>
        <TabsContent value="all-posts"><AdminPostsTab /></TabsContent>
        <TabsContent value="pending"><AdminPendingPostsTab /></TabsContent>
        <TabsContent value="revisions"><AdminRevisionsTab /></TabsContent>
        <TabsContent value="reports"><AdminReportsTab /></TabsContent>
        <TabsContent value="graph"><AdminGraphManager /></TabsContent>
        <TabsContent value="institutional"><AdminInstitutionalTab /></TabsContent>
      </Tabs>
    </div>
  );
}
