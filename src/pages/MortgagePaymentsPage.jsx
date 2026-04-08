import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MortgagePaymentFormDialog from '@/components/MortgagePaymentFormDialog';

export default function MortgagePaymentsPage() {
  const [mortgages, setMortgages] = useState([]);
  const [selectedMortgageId, setSelectedMortgageId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Derived
  const selectedMortgage = mortgages.find((m) => m.id === Number(selectedMortgageId)) || null;
  const existingRecord = records.find((r) => r.month === selectedMonth) || null;

  // On mount: fetch mortgages
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/mortgages');
        const data = await res.json();
        setMortgages(data);
      } catch {
        setApiError('Something went wrong loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchRecords = useCallback(async (mortgageId) => {
    if (!mortgageId) {
      setRecords([]);
      return;
    }
    try {
      const res = await fetch(`/api/mortgage-payments?mortgage_id=${mortgageId}`);
      const data = await res.json();
      setRecords(data);
    } catch {
      setApiError('Could not load payment history. Please try again.');
    }
  }, []);

  // When mortgage changes: fetch records
  useEffect(() => {
    fetchRecords(selectedMortgageId);
  }, [selectedMortgageId, fetchRecords]);

  const sortedRecords = [...records].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Record Mortgage Payment</h2>
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
              value={selectedMortgageId}
              onChange={(e) => setSelectedMortgageId(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1"
            >
              <option value="" disabled>Select mortgage</option>
              {mortgages.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.lender} &mdash; {m.property_address}
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
              disabled={!selectedMortgageId || !selectedMonth}
            >
              {existingRecord ? 'Edit Payment' : 'Record Payment'}
            </Button>
          </div>

          {/* Records section */}
          {selectedMortgageId && (
            <div>
              <h3 className="text-base font-semibold mb-4">
                {selectedMortgage?.lender} &mdash; Payment History
              </h3>

              {sortedRecords.length === 0 ? (
                <p className="text-muted-foreground">
                  No payments recorded yet for this mortgage.
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

      <MortgagePaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mortgage={selectedMortgage}
        month={selectedMonth}
        existingRecord={existingRecord}
        onSaved={() => {
          setFormOpen(false);
          fetchRecords(selectedMortgageId);
        }}
        onDeleted={() => {
          setFormOpen(false);
          fetchRecords(selectedMortgageId);
        }}
      />
    </div>
  );
}
