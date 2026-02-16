import { useState, useCallback } from 'react';

export function useAssetAssignment(assetId: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignAsset = useCallback(async (employeeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/assets/${assetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: employeeId })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to assign asset');
      }

      onSuccess?.();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign asset';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assetId, onSuccess]);

  const unassignAsset = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/assets/${assetId}/assign`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to unassign asset');
      }

      onSuccess?.();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unassign asset';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assetId, onSuccess]);

  const approveRequestAndAssign = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve request');
      }

      onSuccess?.();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve request';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assetId, onSuccess]);

  return { assignAsset, unassignAsset, approveRequestAndAssign, loading, error };
}

export function useAuditLogs(entityType: string, entityId: string) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/audit-logs?entityType=${entityType}&entityId=${entityId}`);
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data);
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  return { logs, loading, error, fetchLogs };
}

export function usePendingRequests(category: string) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/requests');
      const result = await response.json();
      
      if (result.success) {
        const filtered = result.data.filter((req: any) => 
          req.assetCategory === category && 
          req.status === 'pending' &&
          req.requestType === 'assignment'
        );
        setRequests(filtered);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch requests';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  return { requests, loading, error, fetchRequests };
}
