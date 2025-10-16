"use client";

import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit, 
  UserPlus, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Package,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Skeleton } from '@/components/SkeletonLoader';

interface BulkOperation {
  id: string;
  type: 'delete' | 'update_status' | 'assign_task' | 'export' | 'archive';
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  requiresConfirmation: boolean;
}

interface SelectableItem {
  id: string;
  name: string;
  status?: string;
  department?: string;
  createdAt?: Date;
  type: 'order' | 'item' | 'user' | 'category';
}

interface BulkOperationsPanelProps {
  items: SelectableItem[];
  onBulkAction: (action: string, selectedIds: string[], additionalData?: any) => Promise<void>;
  onRefresh: () => void;
  itemType: 'orders' | 'items' | 'users' | 'categories';
  loading?: boolean;
}

const bulkOperations: BulkOperation[] = [
  {
    id: 'delete',
    type: 'delete',
    label: 'حذف المحدد',
    description: 'حذف العناصر المحددة نهائياً',
    icon: Trash2,
    color: 'red',
    requiresConfirmation: true
  },
  {
    id: 'update_status',
    type: 'update_status',
    label: 'تحديث الحالة',
    description: 'تحديث حالة العناصر المحددة',
    icon: Edit,
    color: 'blue',
    requiresConfirmation: false
  },
  {
    id: 'assign_task',
    type: 'assign_task',
    label: 'تعيين مهام',
    description: 'تعيين مهام للموظفين المحددين',
    icon: UserPlus,
    color: 'green',
    requiresConfirmation: false
  },
  {
    id: 'export',
    type: 'export',
    label: 'تصدير البيانات',
    description: 'تصدير العناصر المحددة إلى ملف',
    icon: Download,
    color: 'purple',
    requiresConfirmation: false
  },
  {
    id: 'archive',
    type: 'archive',
    label: 'أرشفة',
    description: 'نقل العناصر المحددة إلى الأرشيف',
    icon: Package,
    color: 'orange',
    requiresConfirmation: true
  }
];

const statusOptions = [
  { value: 'pending', label: 'في الانتظار', color: 'yellow' },
  { value: 'confirmed', label: 'مؤكد', color: 'blue' },
  { value: 'preparing', label: 'قيد التحضير', color: 'orange' },
  { value: 'ready', label: 'جاهز', color: 'green' },
  { value: 'delivered', label: 'تم التسليم', color: 'green' },
  { value: 'cancelled', label: 'ملغي', color: 'red' }
];

const departmentOptions = [
  { value: 'kitchen', label: 'المطبخ', color: 'red' },
  { value: 'barista', label: 'البارستا', color: 'blue' },
  { value: 'shisha', label: 'الشيشة', color: 'green' }
];

export default function BulkOperationsPanel({ 
  items, 
  onBulkAction, 
  onRefresh, 
  itemType,
  loading = false 
}: BulkOperationsPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [additionalData, setAdditionalData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesDepartment = !departmentFilter || item.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredItems.length);
  };

  // Handle bulk operation
  const handleBulkOperation = async (operation: BulkOperation) => {
    if (selectedItems.size === 0) return;

    setSelectedOperation(operation);
    
    if (operation.requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      await executeOperation(operation);
    }
  };

  // Execute the bulk operation
  const executeOperation = async (operation: BulkOperation) => {
    setIsProcessing(true);
    try {
      await onBulkAction(operation.type, Array.from(selectedItems), additionalData);
      setSelectedItems(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      setSelectedOperation(null);
      setShowConfirmation(false);
      setAdditionalData({});
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm operation
  const confirmOperation = async () => {
    if (selectedOperation) {
      await executeOperation(selectedOperation);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'gray';
  };

  // Get department color
  const getDepartmentColor = (department: string) => {
    const deptOption = departmentOptions.find(opt => opt.value === department);
    return deptOption?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/2 mb-1" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">العمليات المجمعة</h2>
            <p className="text-white/70">إدارة متقدمة للعناصر المحددة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">تصفية العناصر</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث في العناصر..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {itemType === 'orders' && (
              <div>
                <label className="block text-sm text-white/70 mb-2">الحالة</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">جميع الحالات</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm text-white/70 mb-2">القسم</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">جميع الأقسام</option>
                {departmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedItems.size > 0 && (
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-bold">{selectedItems.size} عنصر محدد</p>
                <p className="text-white/70 text-sm">من أصل {filteredItems.length} عنصر</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                العمليات المجمعة
              </button>
              
              <button
                onClick={() => {
                  setSelectedItems(new Set());
                  setSelectAll(false);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedItems.size > 0 && (
        <div className="glass-effect rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">اختر العملية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulkOperations.map((operation) => {
              const IconComponent = operation.icon;
              return (
                <button
                  key={operation.id}
                  onClick={() => handleBulkOperation(operation)}
                  className={`p-4 rounded-xl transition-all hover:scale-105 ${
                    operation.color === 'red' ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30' :
                    operation.color === 'blue' ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30' :
                    operation.color === 'green' ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30' :
                    operation.color === 'purple' ? 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30' :
                    'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`w-6 h-6 ${
                      operation.color === 'red' ? 'text-red-400' :
                      operation.color === 'blue' ? 'text-blue-400' :
                      operation.color === 'green' ? 'text-green-400' :
                      operation.color === 'purple' ? 'text-purple-400' :
                      'text-orange-400'
                    }`} />
                    <h4 className="text-white font-bold">{operation.label}</h4>
                  </div>
                  <p className="text-white/70 text-sm">{operation.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">العناصر ({filteredItems.length})</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              {selectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              تحديد الكل
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedItems.has(item.id) 
                  ? 'bg-blue-500/20 border border-blue-500/30' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <button
                onClick={() => handleItemSelect(item.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {selectedItems.has(item.id) ? 
                  <CheckSquare className="w-5 h-5 text-blue-400" /> : 
                  <Square className="w-5 h-5" />
                }
              </button>
              
              <div className="flex-1">
                <h4 className="text-white font-medium">{item.name}</h4>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  {item.status && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      getStatusColor(item.status) === 'red' ? 'bg-red-500/20 text-red-400' :
                      getStatusColor(item.status) === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      getStatusColor(item.status) === 'green' ? 'bg-green-500/20 text-green-400' :
                      getStatusColor(item.status) === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {statusOptions.find(opt => opt.value === item.status)?.label || item.status}
                    </span>
                  )}
                  
                  {item.department && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      getDepartmentColor(item.department) === 'red' ? 'bg-red-500/20 text-red-400' :
                      getDepartmentColor(item.department) === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {departmentOptions.find(opt => opt.value === item.department)?.label || item.department}
                    </span>
                  )}
                  
                  {item.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-effect rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">تأكيد العملية</h3>
            </div>
            
            <p className="text-white/70 mb-6">
              هل أنت متأكد من {selectedOperation.label.toLowerCase()} للعناصر المحددة؟ 
              هذه العملية لا يمكن التراجع عنها.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={confirmOperation}
                disabled={isProcessing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'جاري المعالجة...' : 'تأكيد'}
              </button>
              
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedOperation(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






