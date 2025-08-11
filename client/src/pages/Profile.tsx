import { useState } from 'react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Heart, 
  BookOpen, 
  MessageSquare,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  // Initialize form data when user is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return apiRequest('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white page-content">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <User className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white page-content">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="glass border border-white/10 p-8 text-center">
              <CardContent>
                <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Authentication Required</h2>
                <p className="text-gray-400">Please sign in to access your profile.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-black text-white page-content">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light">
            <span className="text-gradient-echo font-medium">Your</span>
            <span className="text-gradient-soul font-light"> Profile</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage your EchoSoul account and personalize your emotional wellness journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="glass border border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold text-white">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="hover:bg-white/10 text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="hover:bg-red-500/10 text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.profileImageUrl || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-2xl">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || 'Welcome to EchoSoul'
                      }
                    </h3>
                    <p className="text-gray-400">{user.email}</p>
                    <Badge className="mt-1 bg-gradient-to-r from-green-400/20 to-blue-400/20 text-green-400 border-green-400/30">
                      <Heart className="w-3 h-3 mr-1" />
                      Active Member
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <p className="text-white py-2">{user.firstName || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <p className="text-white py-2">{user.lastName || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Read-only fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <p className="text-white py-2">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member Since
                    </Label>
                    <p className="text-white py-2">{memberSince}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <Card className="glass border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Your Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Wellness Tools</span>
                  </div>
                  <span className="text-white font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">AI Sessions</span>
                  </div>
                  <span className="text-white font-medium">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-gray-300">Account Status</span>
                  </div>
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="glass border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Your account is secured with Google authentication. All your wellness data is encrypted and private.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300">Two-Factor Auth</span>
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Google</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300">Data Encryption</span>
                    <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;