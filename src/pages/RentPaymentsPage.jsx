import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RentPaymentFormDialog from '@/components/RentPaymentFormDialog';

export default function RentPaymentsPage() {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Derived
  const filteredTenants = tenants.filter(
    (t) => t.property_id === Number(selectedPropertyId)
  );
  const selectedTenant = tenants.find((t) => t.id === Number(selectedTenantId)) || null;
  const existingRecord = records.find((r) => r.month === selectedMonth) || null;

  // On mount: fetch properties and tenants in parallel
  useEffect(() => {
    async function loadData() {
      try {
        const [propRes, tenRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/tenants'),
        ]);
        const [props, tens] = await Promise.all([propRes.json(), tenRes.json()]);
        setProperties(props);
        setTenants(tens);
      } catch {
        setApiError('Something went wrong loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When property changes, reset tenant selection
  function handlePropertyChange(e) {
    setSelectedPropertyId(e.target.value);
    setSelectedTenantId('');
    setRecords([]);
  }

  const fetchRecords = useCallback(async (tenantId) => {
    if (!tenantId) {
      setRecords([]);
      return;
    }
    try {
      const res = await fetch(`/api/rent-payments?tenant_id=${tenantId}`);
      const data = await res.json();
      setRecords(data);
    } catch {
      setApiError('Could not load payment history. Please try again.');
    }
  }, []);

  // When tenant changes: fetch records
  useEffect(() => {
    fetchRecords(selectedTenantId);
  }, [selectedTenantId, fetchRecords]);

  const sortedRecords = [...records].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Record Rent Payment</h2>
      </div>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && (
        <>
          {/* Selector row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={selectedPropertyId}
              onChange={handlePropertyChange}
              className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1"
            >
              <option value="" disabled>Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>

            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              disabled={!selectedPropertyId}
              className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select tenant</option>
              {filteredTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1"
            />
          </div>

          {/* Record Payment button */}
          <div className="mb-8">
            <Button
              onClick={() => setFormOpen(true)}
              disabled={!selectedTenantId || !selectedMonth}
            >
              {existingRecord ? 'Edit Payment' : 'Record Payment'}
            </Button>
          </div>

          {/* Records section */}
          {selectedTenantId && (
            <div>
              <h3 className="text-base font-semibold mb-4">
                {selectedTenant?.name} &mdash; Payment History
              </h3>

              {sortedRecords.length === 0 ? (
                <p className="text-muted-foreground">
                  No payments recorded yet for this tenant.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                          Month
                        </th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                          Paid Date
                        </th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRecords.map((record) => (
                        <tr key={record.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{record.month}</td>
                          <td className="py-2 pr-4">{record.paid_date}</td>
                          <td className="py-2 pr-4">
                            ${Number(record.amount_paid).toFixed(2)}
                          </td>
                          <td className="py-2">
                            {record.is_on_time === 1 ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                On Time
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Late</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <RentPaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tenant={selectedTenant}
        month={selectedMonth}
        existingRecord={existingRecord}
        onSaved={() => {
          setFormOpen(false);
          fetchRecords(selectedTenantId);
        }}
        onDeleted={() => {
          setFormOpen(false);
          fetchRecords(selectedTenantId);
        }}
      />
    </div>
  );
}
