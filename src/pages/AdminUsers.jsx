import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield,
  Trash2,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviteName, setInviteName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inviting, setInviting] = useState(false);

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

  // Get company context - either from user's company_id or from localStorage (for platform admins)
  const companyId = user?.company_id || localStorage.getItem('selected_company_id');

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const companies = await base44.entities.Company.list();
      return companies.find(c => c.id === companyId);
    },
    enabled: !!companyId
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers', companyId],
    queryFn: async () => {
      const users = await base44.entities.User.list('-created_date');
      // Filter users by company
      return users.filter(u => u.company_id === companyId);
    },
    enabled: !!companyId,
    initialData: []
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
    }
  });

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteName) {
      alert("Please enter both email and full name");
      return;
    }

    if (!companyId) {
      alert("Company context not found. Please ensure you're accessing from a company context.");
      return;
    }

    setInviting(true);
    try {
      // Invite user with company assignment
      await base44.auth.inviteUser({
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole
      });

      // After invitation, we need to update the user record with company_id
      // Wait a moment for the user to be created
      setTimeout(async () => {
        try {
          const users = await base44.entities.User.list();
          const newUser = users.find(u => u.email === inviteEmail);
          if (newUser) {
            await base44.entities.User.update(newUser.id, { company_id: companyId });
          }
        } catch (error) {
          console.error("Failed to assign company:", error);
        }
      }, 2000);
      
      alert(`User ${inviteEmail} has been invited to ${company?.name || 'the company'}!`);
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("user");
      queryClient.invalidateQueries(['allUsers']);
    } catch (error) {
      console.error("Invite failed:", error);
      alert(`Failed to invite user: ${error.message || 'Unknown error'}`);
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (userId === user?.id) {
      alert("You cannot change your own role");
      return;
    }
    
    if (confirm(`Change this user's role to ${newRole}?`)) {
      updateUserMutation.mutate({
        userId,
        data: { role: newRole }
      });
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    "admin": "bg-purple-100 text-purple-700 border-purple-200",
    "coach": "bg-blue-100 text-blue-700 border-blue-200",
    "user": "bg-green-100 text-green-700 border-green-200",
    "rep": "bg-orange-100 text-orange-700 border-orange-200"
  };

  // Check if current user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600">You must be an administrator to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">
            {company?.name ? `Manage users for ${company.name}` : 'Invite and manage team members'}
          </p>
        </div>
        <Button 
          onClick={() => setShowInviteDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/30"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{allUsers.length}</div>
            <div className="text-xs text-slate-600">Total Users</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {allUsers.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-xs text-slate-600">Admins</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {allUsers.filter(u => u.role === 'coach').length}
            </div>
            <div className="text-xs text-slate-600">Coaches</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {allUsers.filter(u => u.role === 'user' || u.role === 'rep').length}
            </div>
            <div className="text-xs text-slate-600">Reps</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => handleChangeRole(u.id, newRole)}
                        disabled={u.id === user?.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={roleColors[u.role] || "bg-slate-100 text-slate-700"}>
                              {u.role}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="user">Rep</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {u.created_date && new Date(u.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Users className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">
                {searchTerm ? "Try adjusting your search" : "Invite users to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite New User
            </DialogTitle>
            <DialogDescription>
              Add a new user to {company?.name || 'your company'}. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Rep (Standard User)</SelectItem>
                  <SelectItem value="coach">Coach (Can review submissions)</SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {inviteRole === 'user' && "Can access training, log field activity, and submit roleplays"}
                {inviteRole === 'coach' && "Can review submissions and access analytics"}
                {inviteRole === 'admin' && "Full access to all features and user management"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInviteDialog(false)}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUser}
              disabled={inviting || !inviteEmail || !inviteName}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}