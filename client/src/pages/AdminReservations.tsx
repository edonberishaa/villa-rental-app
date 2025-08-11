import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface ReservationRow {
  id: number;
  reservationCode: string;
  villa?: { name: string };
  startDate: string;
  endDate: string;
  guestName: string;
  status: string;
}

const AdminReservations: React.FC = () => {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/reservation').then(r=>{ setRows(r.data); setLoading(false); }); }, []);
  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Reservations</h2>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Code</th><th>Villa</th><th>Dates</th><th>Guest</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td>{r.reservationCode}</td>
              <td>{r.villa?.name}</td>
              <td>{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</td>
              <td>{r.guestName}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservations;


