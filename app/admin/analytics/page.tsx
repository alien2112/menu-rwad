"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminAuth } from "@/components/AdminAuth";
import { IOrder } from "@/lib/models/Order";
import { TrendingUp, ShoppingBag, Wallet, PieChart } from "lucide-react";

type Order = IOrder;

function StatCard({ title, value, subtitle, icon: Icon, colorClass = "text-white" }: { title: string; value: string | number; subtitle?: string; icon: any; colorClass?: string; }) {
  return (
    <div className="glass-effect rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/50 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-white/10 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/80 text-sm truncate max-w-[65%]">{label}</span>
        <span className="text-white/60 text-xs">{value}</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#C2914A] to-[#B8853F]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders?limit=500');
        const json = await res.json();
        if (!cancelled) {
          if (json.success) {
            setOrders(json.data || []);
          } else {
            setError(json.error || 'Failed to load orders');
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0) - (o.discountAmount || 0), 0);
    const takeawayOrders = orders.filter(o => (o.notes || '').includes('تيك أواي')).length;
    const dineInOrders = totalOrders - takeawayOrders;
    const topItemsMap = new Map<string, { name: string; count: number }>();
    for (const o of orders) {
      for (const it of o.items || []) {
        const entry = topItemsMap.get(it.menuItemId) || { name: it.menuItemName, count: 0 };
        entry.count += it.quantity;
        topItemsMap.set(it.menuItemId, entry);
      }
    }
    const topItems = Array.from(topItemsMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);
    const maxTop = topItems[0]?.count || 0;
    return { totalOrders, totalRevenue, takeawayOrders, dineInOrders, topItems, maxTop };
  }, [orders]);

  return (
    <AdminAuth>
      <div className="space-y-6">
        <h1 className="text-white text-2xl font-bold">التحليلات</h1>

        {loading ? (
          <div className="text-white/80">جاري التحميل...</div>
        ) : error ? (
          <div className="text-red-300">{error}</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="إجمالي الطلبات" value={stats.totalOrders} icon={ShoppingBag} />
              <StatCard title="إجمالي الإيرادات" value={`${stats.totalRevenue.toFixed(2)} ر.س`} icon={Wallet} />
              <StatCard title="طلبات التيك أواي" value={stats.takeawayOrders} icon={TrendingUp} />
              <StatCard title="طلبات داخل المطعم" value={stats.dineInOrders} icon={PieChart} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top items */}
              <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <h2 className="text-white text-lg font-semibold mb-4">أكثر العناصر طلباً</h2>
                <div className="space-y-3">
                  {stats.topItems.length === 0 ? (
                    <p className="text-white/60 text-sm">لا توجد بيانات كافية</p>
                  ) : (
                    stats.topItems.map((it) => (
                      <Bar key={it.name} label={it.name} value={it.count} max={stats.maxTop} />
                    ))
                  )}
                </div>
              </div>

              {/* Orders over time (by day) */}
              <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <h2 className="text-white text-lg font-semibold mb-4">عدد الطلبات حسب اليوم</h2>
                <OrdersByDayChart orders={orders} />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminAuth>
  );
}

function OrdersByDayChart({ orders }: { orders: Order[] }) {
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const d = new Date(o.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    const max = entries.reduce((m, [,v]) => Math.max(m, v), 0);
    return { entries, max };
  }, [orders]);

  if (buckets.entries.length === 0) {
    return <p className="text-white/60 text-sm">لا توجد بيانات كافية</p>;
  }

  return (
    <div className="space-y-3">
      {buckets.entries.map(([day, count]) => (
        <Bar key={day} label={day} value={count} max={buckets.max} />
      ))}
    </div>
  );
}


