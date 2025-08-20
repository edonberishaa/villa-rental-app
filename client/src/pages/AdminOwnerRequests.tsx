import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const AdminOwnerRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/requests');
      setRequests(res.data);
    } catch (e) {
      push('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'refuse') => {
    try {
      await api.post(`/owner/requests/${id}/${action}`);
      push(`Request ${action}d`, 'success');
      fetchRequests();
    } catch (e) {
      push('Action failed', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Owner Access Requests</h1>
      {loading ? <div>Loading...</div> : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-800">
              <th className="p-2">User</th>
              <th className="p-2">Requested At</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.Id} className="border-t">
                <td className="p-2">{r.User?.email || r.User?.Email}</td>
                <td className="p-2">{new Date(r.RequestedAt).toLocaleString()}</td>
                <td className="p-2">
                  {r.Approved === true ? <span className="text-green-600">Approved</span> :
                   r.Approved === false ? <span className="text-red-600">Refused</span> :
                   <span className="text-yellow-600">Pending</span>}
                </td>
                <td className="p-2">
                  {r.Approved == null && <>
                    <button onClick={() => handleAction(r.Id, 'approve')} className="px-2 py-1 bg-green-500 text-white rounded mr-2">Approve</button>
                    <button onClick={() => handleAction(r.Id, 'refuse')} className="px-2 py-1 bg-red-500 text-white rounded">Refuse</button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOwnerRequests;
