
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, Edit, Save, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Profile = () => {
  const { user, updateProfile, updatePassword, isLoading } = useAuth();
  
  // Profile form state
  const [profileFormData, setProfileFormData] = useState({
    username: user?.username || '',
    weight: user?.weight || '',
    height: user?.height || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  
  // Password form state
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileFormData.username) {
      errors.username = 'Username is required';
    }
    
    if (profileFormData.weight && isNaN(Number(profileFormData.weight))) {
      errors.weight = 'Weight must be a number';
    }
    
    if (profileFormData.height && isNaN(Number(profileFormData.height))) {
      errors.height = 'Height must be a number';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordFormData.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    
    if (!passwordFormData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordFormData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      const profileData = {
        username: profileFormData.username,
        weight: profileFormData.weight ? Number(profileFormData.weight) : undefined,
        height: profileFormData.height ? Number(profileFormData.height) : undefined
      };
      
      await updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      await updatePassword(passwordFormData);
      
      // Reset form after successful update
      setPasswordFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Key className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="bg-dark-light border-dark-lighter">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profileFormData.username}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={profileErrors.username ? 'border-destructive' : ''}
                      />
                      {profileErrors.username && (
                        <p className="text-sm text-destructive">{profileErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled={true}
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={profileFormData.weight}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          className={profileErrors.weight ? 'border-destructive' : ''}
                        />
                        {profileErrors.weight && (
                          <p className="text-sm text-destructive">{profileErrors.weight}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={profileFormData.height}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          className={profileErrors.height ? 'border-destructive' : ''}
                        />
                        {profileErrors.height && (
                          <p className="text-sm text-destructive">{profileErrors.height}</p>
                        )}
                      </div>
                    </div>
                    
                    {isEditingProfile && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditingProfile(false);
                            // Reset form to user data
                            setProfileFormData({
                              username: user?.username || '',
                              weight: user?.weight || '',
                              height: user?.height || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="yellow-gradient"
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="bg-dark-light border-dark-lighter">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Current Password</Label>
                      <Input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        value={passwordFormData.oldPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.oldPassword ? 'border-destructive' : ''}
                      />
                      {passwordErrors.oldPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.oldPassword}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordFormData.newPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.newPassword ? 'border-destructive' : ''}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordFormData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Password requirements</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside text-sm">
                          <li>Minimum 6 characters</li>
                          <li>Using a mix of letters, numbers and symbols is recommended</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        className="yellow-gradient"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
