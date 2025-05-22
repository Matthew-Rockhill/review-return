import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const [customersRes, metricsRes] = await Promise.all([
          fetch('/api/admin/customers'),
          fetch('/api/admin/metrics'),
        ]);

        const customersData = await customersRes.json();
        const metricsData = await metricsRes.json();

        setCustomers(customersData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Portal</h1>
      <h2>Customers</h2>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
      <h2>Metrics</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
} 