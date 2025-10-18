"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Badge } from "@/components/admin/Badge";
import { Input } from "@/components/admin/Input";
import { Label } from "@/components/admin/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { Download, Trash2, Archive, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { AlertDialog } from "@/components/admin/AlertDialog";
import { useAlert, useConfirmation } from "@/components/ui/alerts";

interface ArchiveLog {
  _id: string;
  archiveType: 'orders' | 'usage' | 'notifications';
  period: {
    startDate: string;
    endDate: string;
  };
  recordCount: number;
  filePath?: string;
  googleDriveFileId?: string;
  googleDriveUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export default function ArchivingDashboard() {
  const [archives, setArchives] = useState<ArchiveLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Create archive form state
  const [createForm, setCreateForm] = useState({
    archiveType: 'orders' as 'orders' | 'usage' | 'notifications',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/archive');
      const data = await response.json();
      if (data.success) {
        setArchives(data.data);
      }
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        // Download the Excel file
        if (data.data.downloadData) {
          const link = document.createElement('a');
          link.href = `data:${data.data.mimeType};base64,${data.data.downloadData}`;
          link.download = data.data.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        setCreateForm({
          archiveType: 'orders',
          startDate: '',
          endDate: ''
        });
        setShowCreateForm(false);
        fetchArchives(); // Refresh the list
      } else {
        showAlert('Error', 'Failed to create archive: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating archive:', error);
      showAlert('Error', 'Failed to create archive');
    }
  };

  const triggerCleanup = async () => {
    confirm(
      {
        title: 'تنظيف البيانات',
        message: 'This will automatically archive and clean old data with Excel exports. Continue?',
        confirmText: 'متابعة',
        cancelText: 'إلغاء',
        type: 'warning',
      },
      async () => {
        try {
          const response = await fetch('/api/cleanup-with-export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'manual-cleanup'}`
            },
          });

          const data = await response.json();
          if (data.success) {
            // Download all Excel files
            data.data.excelFiles.forEach((file: any) => {
              const link = document.createElement('a');
              link.href = `data:${file.mimeType};base64,${file.data}`;
              link.download = file.fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
            
            showSuccess(`تم تنظيف البيانات بنجاح!\nالطلبات: ${data.data.ordersDeleted}\nالاستخدام: ${data.data.usageDeleted}\nالإشعارات: ${data.data.notificationsDeleted}\nملفات Excel المحملة: ${data.data.excelFiles.length}`);
            fetchArchives(); // Refresh the list
          } else {
            showError('فشل تنظيف البيانات: ' + data.error);
          }
        } catch (error) {
          console.error('Error triggering cleanup:', error);
          showError('فشل في تشغيل التنظيف');
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge><Archive className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'orders':
        return <Archive className="w-5 h-5 text-blue-500" />;
      case 'usage':
        return <Trash2 className="w-5 h-5 text-orange-500" />;
      case 'notifications':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Archive className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredArchives = archives.filter(archive => {
    const matchesType = filterType === 'all' || archive.archiveType === filterType;
    const matchesStatus = filterStatus === 'all' || archive.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const totalArchives = archives.length;
  const completedArchives = archives.filter(a => a.status === 'completed').length;
  const failedArchives = archives.filter(a => a.status === 'failed').length;
  const totalRecordsArchived = archives.reduce((sum, a) => sum + a.recordCount, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-32 rounded-lg animate-pulse" />
            <div className="h-10 w-28 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-32 rounded animate-pulse" />
                <div className="h-8 w-8 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-16 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="h-10 w-40 rounded-lg animate-pulse" />
          <div className="h-10 w-40 rounded-lg animate-pulse" />
        </div>

        {/* Archives List */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-40 rounded animate-pulse" />
                    <div className="h-4 w-64 rounded animate-pulse" />
                    <div className="h-4 w-80 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded animate-pulse" />
                  <div className="h-4 w-48 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Archive className="w-8 h-8" />
          Data Archiving Dashboard
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Archive className="w-4 h-4 mr-2" />
            Create Archive
          </Button>
          <Button onClick={triggerCleanup}>
            <Trash2 className="w-4 h-4 mr-2" />
            Auto Cleanup
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archives</CardTitle>
            <Archive className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArchives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedArchives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedArchives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Archived</CardTitle>
            <Download className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecordsArchived.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Archive Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="orders">Orders</SelectItem>
            <SelectItem value="usage">Material Usage</SelectItem>
            <SelectItem value="notifications">Notifications</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Archives List */}
      <div className="space-y-4">
        {filteredArchives.map((archive) => (
          <Card key={archive._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getTypeIcon(archive.archiveType)}
                  <div>
                    <CardTitle className="text-lg capitalize">{archive.archiveType} Archive</CardTitle>
                    <div className="text-sm mt-1">
                      Period: {new Date(archive.period.startDate).toLocaleDateString()} - {new Date(archive.period.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      Created: {new Date(archive.createdAt).toLocaleString()}
                      {archive.completedAt && (
                        <span> | Completed: {new Date(archive.completedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(archive.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">
                    Records: {archive.recordCount.toLocaleString()}
                  </p>
                  {archive.filePath && (
                    <p className="text-sm">
                      File: {archive.filePath}
                    </p>
                  )}
                  {archive.errorMessage && (
                    <p className="text-sm text-red-600">
                      Error: {archive.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {archive.filePath && (
                    <Button
                      size="sm"
                      onClick={() => {
                        // For now, show a message that file was downloaded during creation
                        showAlert('Info', 'File was downloaded when archive was created. File: ' + archive.filePath);
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArchives.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Archive className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No archives found</h3>
            <p>Create your first archive to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Create Archive Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Archive</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateArchive} className="space-y-4">
                <div>
                  <Label htmlFor="archiveType">Archive Type</Label>
                  <Select 
                    value={createForm.archiveType} 
                    onValueChange={(value: any) => setCreateForm({...createForm, archiveType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="usage">Material Usage</SelectItem>
                      <SelectItem value="notifications">Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Archive</Button>
                  <Button type="button" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
      {ConfirmationComponent}
    </div>
  );
}
