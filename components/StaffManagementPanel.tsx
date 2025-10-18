"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Clock, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  UserCheck, 
  UserX,
  Star,
  Clock3
} from 'lucide-react';

interface StaffMember {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  performance?: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    efficiency: number;
    rating: number;
    tasksCompleted: number;
    tasksPending: number;
  };
  activity?: {
    loginCount: number;
    lastActivity: Date;
    hoursWorked: number;
    status: 'online' | 'offline' | 'busy';
  };
}

interface StaffManagementPanelProps {
  onRefresh: () => void;
  loading?: boolean;
}

const roleOptions = [
  { value: 'admin', label: 'مدير', color: 'purple', description: 'صلاحيات كاملة' },
  { value: 'kitchen', label: 'مطبخ', color: 'red', description: 'إدارة المطبخ' },
  { value: 'barista', label: 'بارستا', color: 'blue', description: 'إدارة المشروبات' },
  { value: 'shisha', label: 'شيشة', color: 'green', description: 'إدارة الشيشة' }
];

const statusOptions = [
  { value: 'online', label: 'متصل', color: 'green' },
  { value: 'offline', label: 'غير متصل', color: 'gray' },
  { value: 'busy', label: 'مشغول', color: 'orange' }
];

export default function StaffManagementPanel({ onRefresh, loading = false }: StaffManagementPanelProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'activity'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'kitchen' as 'admin' | 'kitchen' | 'barista' | 'shisha',
    isActive: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/staff');
      const result = await response.json();
      
      if (result.success) {
        setStaff(result.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setStaff([...staff, result.data]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setStaff(staff.map(s => s.id === selectedStaff.id ? result.data : s));
        setShowEditModal(false);
        setSelectedStaff(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setStaff(staff.filter(s => s.id !== staffId));
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/toggle-status`, {
        method: 'PATCH'
      });
      
      const result = await response.json();
      if (result.success) {
        setStaff(staff.map(s => s.id === staffId ? result.data : s));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'kitchen',
      isActive: true
    });
  };

  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      username: staffMember.username,
      name: staffMember.name,
      password: '',
      role: staffMember.role,
      isActive: staffMember.isActive
    });
    setShowEditModal(true);
  };

  const openPerformanceModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowPerformanceModal(true);
  };

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesStatus = !statusFilter || member.activity?.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role color
  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    return roleOption?.color || 'gray';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'gray';
  };

  // Calculate performance metrics
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.isActive).length;
  const onlineStaff = staff.filter(s => s.activity?.status === 'online').length;
  const averagePerformance = staff.reduce((acc, s) => acc + (s.performance?.efficiency || 0), 0) / totalStaff;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 admin-card rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">إدارة الموظفين</h2>
            <p>إدارة شاملة لفريق العمل</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-button"
          >
            <UserPlus className="w-4 h-4" />
            إضافة موظف
          </button>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="admin-button"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">إجمالي الموظفين</p>
              <p className="text-2xl font-bold">{totalStaff}</p>
            </div>
            <div className="p-3 admin-card rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">الموظفين النشطين</p>
              <p className="text-2xl font-bold">{activeStaff}</p>
            </div>
            <div className="p-3 admin-card rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">متصل الآن</p>
              <p className="text-2xl font-bold">{onlineStaff}</p>
            </div>
            <div className="p-3 admin-card rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">متوسط الأداء</p>
              <p className="text-2xl font-bold">{averagePerformance.toFixed(1)}%</p>
            </div>
            <div className="p-3 admin-card rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في الموظفين..."
                className="admin-input w-full pr-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-2">الدور</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-input w-full"
            >
              <option value="">جميع الأدوار</option>
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-2">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-input w-full"
            >
              <option value="">جميع الحالات</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="admin-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">قائمة الموظفين ({filteredStaff.length})</h3>
        </div>

        <div className="space-y-3">
          {filteredStaff.map((member) => (
            <div
              key={member._id || member.id}
              className="flex items-center gap-4 p-4 admin-card rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center`}>
                  <Users className={`w-6 h-6`} />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold">{member.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs`}>
                    {roleOptions.find(opt => opt.value === member.role)?.label}
                  </span>
                  
                  {member.activity?.status && (
                    <span className={`px-2 py-1 rounded-full text-xs`}>
                      {statusOptions.find(opt => opt.value === member.activity.status)?.label}
                    </span>
                  )}
                  
                  {member.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span>@{member.username}</span>
                  {member.lastLogin && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      آخر دخول: {new Date(member.lastLogin).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                  {member.performance && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      تقييم: {member.performance.rating.toFixed(1)}/5
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPerformanceModal(member)}
                  className="admin-button"
                  title="عرض الأداء"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => openEditModal(member)}
                  className="admin-button"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleToggleStatus(member.id)}
                  className={`admin-button ${
                    member.isActive 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  }`}
                  title={member.isActive ? 'إلغاء تفعيل' : 'تفعيل'}
                >
                  {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="admin-button"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="admin-card rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-6 h-6" />
              <h3 className="text-lg font-bold">إضافة موظف جديد</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="admin-input w-full"
                  placeholder="اسم المستخدم"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="admin-input w-full"
                  placeholder="الاسم الكامل"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="admin-input w-full"
                  placeholder="كلمة المرور"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">الدور</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="admin-input w-full"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleAddStaff}
                className="admin-button flex-1"
              >
                إضافة
              </button>
              
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="admin-button flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="admin-card rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Edit className="w-6 h-6" />
              <h3 className="text-lg font-bold">تعديل الموظف</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="admin-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="admin-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">كلمة المرور الجديدة (اختياري)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="admin-input w-full"
                  placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">الدور</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="admin-input w-full"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive">نشط</label>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                className="admin-button flex-1"
              >
                تحديث
              </button>
              
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
                className="admin-button flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="admin-card rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6" />
              <h3 className="text-lg font-bold">أداء الموظف - {selectedStaff.name}</h3>
            </div>
            
            {selectedStaff.performance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="admin-card rounded-lg p-4">
                    <h4 className="font-bold mb-2">إحصائيات الطلبات</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>إجمالي الطلبات:</span>
                        <span className="font-bold">{selectedStaff.performance.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المهام المكتملة:</span>
                        <span className="font-bold">{selectedStaff.performance.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المهام المعلقة:</span>
                        <span className="font-bold">{selectedStaff.performance.tasksPending}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-card rounded-lg p-4">
                    <h4 className="font-bold mb-2">الإيرادات</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>إجمالي الإيرادات:</span>
                        <span className="font-bold">{selectedStaff.performance.totalRevenue.toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط قيمة الطلب:</span>
                        <span className="font-bold">{selectedStaff.performance.averageOrderValue.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="admin-card rounded-lg p-4">
                    <h4 className="font-bold mb-2">الأداء</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>الكفاءة:</span>
                        <span className="font-bold">{selectedStaff.performance.efficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التقييم:</span>
                        <span className="font-bold">{selectedStaff.performance.rating.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-card rounded-lg p-4">
                    <h4 className="font-bold mb-2">النشاط</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>عدد مرات الدخول:</span>
                        <span className="font-bold">{selectedStaff.activity?.loginCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ساعات العمل:</span>
                        <span className="font-bold">{selectedStaff.activity?.hoursWorked || 0} ساعة</span>
                      </div>
                      <div className="flex justify-between">
                        <span>آخر نشاط:</span>
                        <span className="font-bold">
                          {selectedStaff.activity?.lastActivity ? 
                            new Date(selectedStaff.activity.lastActivity).toLocaleDateString('ar-SA') : 
                            'غير محدد'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                <p>لا توجد بيانات أداء متاحة لهذا الموظف</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowPerformanceModal(false);
                  setSelectedStaff(null);
                }}
                className="admin-button"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






