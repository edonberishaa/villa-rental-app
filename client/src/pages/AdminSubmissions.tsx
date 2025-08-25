import React, { useEffect, useState } from 'react';
import { approveSubmission, listSubmissions, rejectSubmission, type PropertySubmissionDTO } from '../services/submissionService';
import { useToast } from '../components/Toast';

const AdminSubmissions: React.FC = () => {
  const { push } = useToast();
  const [rows, setRows] = useState<PropertySubmissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All'|'Pending'|'Approved'|'Rejected'>('Pending');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSubmissions(filter === 'All' ? undefined : filter);
      setRows(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const doApprove = async (id: number) => {
    try{
    await approveSubmission(id);
    push('Submission approved and villa created.', 'success');
    }
    catch(err : any){
      const msg = err?.response?.data?.message || "Failed to approve villa. Listing fee not paid.";
      push(msg,"error");
    }
    load();
  };
  const doReject = async (id: number) => {
    await rejectSubmission(id);
    push('Submission rejected.', 'success');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Owner submissions</h1>
        <select className="input w-40" value={filter} onChange={e=>setFilter(e.target.value as any)}>
          {['All','Pending','Approved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card p-4">
        {loading ? 'Loading...' : (
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Owner</th><th>Property</th><th>Region</th><th>Price</th><th>Status</th><th/></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="whitespace-nowrap">{r.ownerEmail}</td>
                  <td>{r.name}</td>
                  <td>{r.region}</td>
                  <td>€{r.pricePerNight}</td>
                  <td>{['Pending','Approved','Rejected'][r.status] || r.status}</td>
                  <td className="text-right space-x-2">
                    {r.status === 0 && <>
                      <button className="btn" onClick={()=>doApprove(r.id)}>Approve</button>
                      <button className="btn" onClick={()=>doReject(r.id)}>Reject</button>
                    </>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center text-neutral-500 py-6">No submissions</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSubmissions;


