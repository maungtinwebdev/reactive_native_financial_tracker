import { useState, useCallback, useRef } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import {
    syncTransactionsToSupabase,
    SyncStatus,
    SyncResult,
} from '@/lib/syncService';

interface UseSyncReturn {
    syncStatus: SyncStatus;
    syncResult: SyncResult | null;
    lastSyncedAt: string | null;
    isSyncing: boolean;
    sync: () => Promise<void>;
    dismissResult: () => void;
}

export function useSync(): UseSyncReturn {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
    const isSyncingRef = useRef(false);

    const transactions = useTransactionStore((state) => state.transactions);

    const sync = useCallback(async () => {
        // Prevent duplicate syncs
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;

        setSyncStatus('syncing');
        setSyncResult(null);

        try {
            const result = await syncTransactionsToSupabase(transactions);
            setSyncStatus(result.status);
            setSyncResult(result);

            if (result.status === 'success') {
                setLastSyncedAt(new Date().toISOString());
            }
        } catch {
            setSyncStatus('error');
            setSyncResult({
                status: 'error',
                message: 'An unexpected error occurred.',
                syncedCount: 0,
                skippedCount: 0,
                errorCount: transactions.length,
            });
        } finally {
            isSyncingRef.current = false;
        }
    }, [transactions]);

    const dismissResult = useCallback(() => {
        setSyncResult(null);
        setSyncStatus('idle');
    }, []);

    return {
        syncStatus,
        syncResult,
        lastSyncedAt,
        isSyncing: syncStatus === 'syncing',
        sync,
        dismissResult,
    };
}
