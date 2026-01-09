import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
  Plus,
  Users,
  TrendingUp,
  Settings,
  ExternalLink,
  Shield,
  BookOpen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PlatformDashboard() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    subdomain: "",
    primary_admin_email: "",
    status: "trial"
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list('-created_date'),
    initialData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const createCompanyMutation = useMutation({
    mutationFn: (companyData) => base44.entities.Company.create({
      ...companyData,
      onboarded_date: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowCreateDialog(false);
      setNewCompany({
        name: "",
        description: "",
        subdomain: "",
        primary_admin_email: "",
        status: "trial"
      });
    }
  });

  const handleCreateCompany = () => {
    if (!newCompany.name || !newCompany.subdomain) {
      alert("Please provide company name and subdomain");
      return;
    }
    createCompanyMutation.mutate(newCompany);
  };

  const handleViewCompany = (companyId) => {
    navigate(createPageUrl("CompanyDetail") + `?id=${companyId}`);
  };

  const handleEnterCompany = (companyId) => {
    localStorage.setItem('selected_company_id', companyId);
    navigate(createPageUrl("Dashboard"));
  };

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-slate-100 text-slate-700 border-slate-200",
    trial: "bg-blue-100 text-blue-700 border-blue-200"
  };

  // Check if user is platform admin
  if (user && user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Platform Admin Access Required</h2>
        <p className="text-slate-600">You need platform administrator privileges to access this page.</p>
      </div>
    );
  }

  const totalUsers = allUsers.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const trialCompanies = companies.filter(c => c.status === 'trial').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage training companies and clients</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{companies.length}</div>
            <div className="text-xs text-slate-600">Total Companies</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{activeCompanies}</div>
            <div className="text-xs text-slate-600">Active Accounts</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{trialCompanies}</div>
            <div className="text-xs text-slate-600">Trial Accounts</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{totalUsers}</div>
            <div className="text-xs text-slate-600">Total Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const companyUsers = allUsers.filter(u => u.company_id === company.id);
              
              return (
                <Card
                  key={company.id}
                  className="border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewCompany(company.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{company.name}</h3>
                        <Badge className={statusColors[company.status]}>
                          {company.status}
                        </Badge>
                      </div>
                      {company.logo_url && (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                    </div>

                    {company.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Subdomain:</span>
                        <span className="font-medium text-slate-900">{company.subdomain}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Users:</span>
                        <span className="font-medium text-slate-900">{companyUsers.length}</span>
                      </div>
                      {company.onboarded_date && (
                        <div className="flex items-center justify-between">
                          <span>Onboarded:</span>
                          <span className="font-medium text-slate-900">
                            {new Date(company.onboarded_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnterCompany(company.id);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Enter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCompany(company.id);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl("CompanyTraining") + `?company_id=${company.id}`);
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manage Training Content
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium">No companies yet</p>
              <p className="text-sm">Create your first training company to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Company Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Company
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                placeholder="Wolf Pack Solar Training"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="subdomain">Subdomain/Slug *</Label>
              <Input
                id="subdomain"
                placeholder="wolfpack"
                value={newCompany.subdomain}
                onChange={(e) => setNewCompany({ ...newCompany, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              />
              <p className="text-xs text-slate-500 mt-1">
                Used for identification (lowercase, no spaces)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Solar door-to-door sales training program..."
                value={newCompany.description}
                onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="admin_email">Primary Admin Email</Label>
              <Input
                id="admin_email"
                type="email"
                placeholder="admin@company.com"
                value={newCompany.primary_admin_email}
                onChange={(e) => setNewCompany({ ...newCompany, primary_admin_email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={newCompany.status}
                onValueChange={(value) => setNewCompany({ ...newCompany, status: value })}
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
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={!newCompany.name || !newCompany.subdomain || createCompanyMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}