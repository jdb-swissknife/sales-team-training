import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  ArrowLeft,
  Users,
  BookOpen,
  Settings,
  Trash2,
  Save,
  UserPlus,
  Shield
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function CompanyDetail() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setCompanyId(id);
  }, []);

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const companies = await dataStore.entities.Company.list();
      return companies.find(c => c.id === companyId);
    },
    enabled: !!companyId
  });

  const { data: companyUsers = [] } = useQuery({
    queryKey: ['companyUsers', companyId],
    queryFn: async () => {
      const allUsers = await dataStore.entities.User.list();
      return allUsers.filter(u => u.company_id === companyId);
    },
    enabled: !!companyId,
    initialData: []
  });

  const { data: companyModules = [] } = useQuery({
    queryKey: ['companyModules', companyId],
    queryFn: async () => {
      const allModules = await dataStore.entities.TrainingModule.list();
      return allModules.filter(m => m.company_id === companyId);
    },
    enabled: !!companyId,
    initialData: []
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data) => dataStore.entities.Company.update(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['company', companyId]);
      queryClient.invalidateQueries(['companies']);
      setEditMode(false);
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: () => dataStore.entities.Company.delete(companyId),
    onSuccess: () => {
      navigate(createPageUrl("PlatformDashboard"));
    }
  });

  const handleSave = () => {
    if (editedCompany) {
      updateCompanyMutation.mutate(editedCompany);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${company?.name}? This will affect all users and data associated with this company.`)) {
      deleteCompanyMutation.mutate();
    }
  };

  const startEdit = () => {
    setEditedCompany({ ...company });
    setEditMode(true);
  };

  if (!company) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading company details...</p>
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-slate-100 text-slate-700 border-slate-200",
    trial: "bg-blue-100 text-blue-700 border-blue-200"
  };

  const adminUsers = companyUsers.filter(u => u.role === 'admin');
  const coachUsers = companyUsers.filter(u => u.role === 'coach');
  const repUsers = companyUsers.filter(u => u.role === 'user' || u.role === 'rep');

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("PlatformDashboard"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Platform
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={statusColors[company.status]}>
              {company.status}
            </Badge>
            <span className="text-slate-600 text-sm">/{company.subdomain}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Button onClick={startEdit} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          ) : (
            <>
              <Button onClick={() => setEditMode(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{companyUsers.length}</div>
            <div className="text-xs text-slate-600">Total Users</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{adminUsers.length}</div>
            <div className="text-xs text-slate-600">Admins</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{repUsers.length}</div>
            <div className="text-xs text-slate-600">Reps</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{companyModules.length}</div>
            <div className="text-xs text-slate-600">Training Modules</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="users">Users ({companyUsers.length})</TabsTrigger>
          <TabsTrigger value="content">Content ({companyModules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company Name</Label>
                {editMode ? (
                  <Input
                    value={editedCompany.name}
                    onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-900 font-medium mt-1">{company.name}</p>
                )}
              </div>

              <div>
                <Label>Subdomain/Slug</Label>
                {editMode ? (
                  <Input
                    value={editedCompany.subdomain}
                    onChange={(e) => setEditedCompany({ ...editedCompany, subdomain: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-900 font-medium mt-1">{company.subdomain}</p>
                )}
              </div>

              <div>
                <Label>Description</Label>
                {editMode ? (
                  <Textarea
                    value={editedCompany.description || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, description: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-600 mt-1">{company.description || 'No description'}</p>
                )}
              </div>

              <div>
                <Label>Account Status</Label>
                {editMode ? (
                  <Select
                    value={editedCompany.status}
                    onValueChange={(value) => setEditedCompany({ ...editedCompany, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={statusColors[company.status]}>
                    {company.status}
                  </Badge>
                )}
              </div>

              <div>
                <Label>Primary Admin Email</Label>
                {editMode ? (
                  <Input
                    type="email"
                    value={editedCompany.primary_admin_email || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, primary_admin_email: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-900 font-medium mt-1">{company.primary_admin_email || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label>Onboarded Date</Label>
                <p className="text-slate-600 mt-1">
                  {company.onboarded_date ? new Date(company.onboarded_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Deleting this company will remove all associated users, training modules, and data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCompanyMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete Company'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Users</CardTitle>
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name}</p>
                      <p className="text-sm text-slate-600">{u.email}</p>
                    </div>
                    <Badge variant="outline">{u.role}</Badge>
                  </div>
                ))}
                {companyUsers.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {companyModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{module.title}</p>
                      <p className="text-sm text-slate-600">{module.category} - {module.stage}</p>
                    </div>
                    <Badge variant="outline">{module.difficulty}</Badge>
                  </div>
                ))}
                {companyModules.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No training modules yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
