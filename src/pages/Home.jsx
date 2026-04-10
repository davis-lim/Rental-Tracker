import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function StatusBadge({ status }) {
  if (status === 'paid_on_time') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid On Time</Badge>;
  if (status === 'paid_late') return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Paid Late</Badge>;
  return <Badge variant="outline">Unpaid</Badge>;
}

function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const now = new Date();
const month = localDateStr(now).slice(0, 7);
const today = localDateStr(now);
const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function Home() {
  const [summary, setSummary] = useState({ tenants: [], mortgages: [] });
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [paying, setPaying] = useState({});

  async function loadDashboard() {
    try {
      const [sumRes, upRes, ovRes] = await Promise.all([
        fetch(`/api/dashboard/summary?month=${month}`),
        fetch(`/api/dashboard/upcoming?month=${month}&today=${today}`),
        fetch(`/api/dashboard/overdue?month=${month}&today=${today}`),
      ]);
      const [sum, up, ov] = await Promise.all([sumRes.json(), upRes.json(), ovRes.json()]);
      setSummary(sum);
      setUpcoming(up);
      setOverdue(ov);
    } catch {
      setApiError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function handleMarkPaid(tenant) {
    setPaying((p) => ({ ...p, [tenant.tenant_id]: true }));
    try {
      const res = await fetch('/api/rent-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant.tenant_id,
          month,
          paid_date: today,
          amount_paid: Number(tenant.rent_amount),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setApiError(err.error || 'Failed to mark as paid.');
      } else {
        await loadDashboard();
      }
    } catch {
      setApiError('Failed to mark as paid. Please try again.');
    } finally {
      setPaying((p) => ({ ...p, [tenant.tenant_id]: false }));
    }
  }

  return (
    <div className="pt-8 space-y-10">
      <h2 className="text-xl font-semibold">{monthLabel} — Dashboard</h2>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{apiError}</div>
      )}
      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && (
        <>
          {/* Monthly totals */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="border rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Rental Income (expected)</p>
              <p className="text-lg font-semibold">${summary.totalRent?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Mortgage Expense</p>
              <p className="text-lg font-semibold">${summary.totalMortgage?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Net (expected)</p>
              <p className={`text-lg font-semibold ${(summary.totalRent - summary.totalMortgage) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                ${((summary.totalRent ?? 0) - (summary.totalMortgage ?? 0)).toFixed(2)}
              </p>
            </div>
          </section>

          {/* Tenants section */}
          <section>
            <h3 className="text-base font-semibold mb-3">Tenants</h3>
            {summary.tenants.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tenants found.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Tenant</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Property</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Rent</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Due</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.tenants.map((t) => (
                    <tr key={t.tenant_id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{t.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{t.property_address}</td>
                      <td className="py-2 pr-4">${Number(t.rent_amount).toFixed(2)}</td>
                      <td className="py-2 pr-4">{t.due_date}</td>
                      <td className="py-2 pr-4"><StatusBadge status={t.status} /></td>
                      <td className="py-2">
                        {t.status !== 'paid_on_time' && t.status !== 'paid_late' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={paying[t.tenant_id]}
                            onClick={() => handleMarkPaid(t)}
                          >
                            {paying[t.tenant_id] ? 'Saving…' : 'Mark Paid'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Mortgages section */}
          <section>
            <h3 className="text-base font-semibold mb-3">Mortgages</h3>
            {summary.mortgages.length === 0 ? (
              <p className="text-muted-foreground text-sm">No mortgages found.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Lender</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Property</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Due</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.mortgages.map((m) => (
                    <tr key={m.mortgage_id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{m.lender}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{m.property_address}</td>
                      <td className="py-2 pr-4">${Number(m.amount).toFixed(2)}</td>
                      <td className="py-2 pr-4">{m.due_date}</td>
                      <td className="py-2"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Upcoming dues section */}
          <section>
            <h3 className="text-base font-semibold mb-3">Upcoming (Next 7 Days)</h3>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments due in the next 7 days.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Name / Lender</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Property</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Due</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{item.name || item.lender}</td>
                      <td className="py-2 pr-4 capitalize text-muted-foreground">{item.type}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{item.property_address}</td>
                      <td className="py-2 pr-4">{item.due_date}</td>
                      <td className="py-2">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Overdue section */}
          <section>
            <h3 className="text-base font-semibold mb-3 text-destructive">Overdue</h3>
            {overdue.length === 0 ? (
              <p className="text-muted-foreground text-sm">No overdue payments.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Name / Lender</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Property</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Due</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{item.name || item.lender}</td>
                      <td className="py-2 pr-4 capitalize text-muted-foreground">{item.type}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{item.property_address}</td>
                      <td className="py-2 pr-4 text-destructive">{item.due_date}</td>
                      <td className="py-2">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
