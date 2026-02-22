import { supabase } from './supabase';
import { Transaction } from '@/store/transactionStore';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
    status: SyncStatus;
    message: string;
    syncedCount: number;
    skippedCount: number;
    errorCount: number;
}

/**
 * Sync all local transactions to Supabase.
 *
 * Strategy:
 * - Upsert each local transaction using its `id` as the conflict key.
 * - This means existing rows are updated and new ones are inserted.
 */
export async function syncTransactionsToSupabase(
    transactions: Transaction[]
): Promise<SyncResult> {
    if (transactions.length === 0) {
        return {
            status: 'success',
            message: 'No transactions to sync.',
            syncedCount: 0,
            skippedCount: 0,
            errorCount: 0,
        };
    }

    try {
        // Map local transactions to the Supabase table schema
        const rows = transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            date: t.date,
            description: t.description,
            category: t.category,
            type: t.type,
            synced_at: new Date().toISOString(),
        }));

        // Upsert in batches of 100 to avoid payload limits
        const BATCH_SIZE = 100;
        let syncedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);

            const { error, data } = await supabase
                .from('transactions')
                .upsert(batch, { onConflict: 'id' })
                .select();

            if (error) {
                console.error(`Sync batch error (offset ${i}):`, error.message);
                errorCount += batch.length;
            } else {
                syncedCount += data?.length ?? batch.length;
            }
        }

        if (errorCount > 0 && syncedCount === 0) {
            return {
                status: 'error',
                message: `Sync failed. ${errorCount} transactions could not be synced.`,
                syncedCount,
                skippedCount: 0,
                errorCount,
            };
        }

        return {
            status: 'success',
            message:
                errorCount > 0
                    ? `Partially synced: ${syncedCount} synced, ${errorCount} failed.`
                    : `Successfully synced ${syncedCount} transactions.`,
            syncedCount,
            skippedCount: 0,
            errorCount,
        };
    } catch (err: any) {
        console.error('Sync error:', err);
        return {
            status: 'error',
            message: err?.message ?? 'An unexpected error occurred during sync.',
            syncedCount: 0,
            skippedCount: 0,
            errorCount: transactions.length,
        };
    }
}

/**
 * Fetches all transactions from Supabase (for potential future pull-sync).
 */
export async function fetchTransactionsFromSupabase(): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, date, description, category, type')
        .order('date', { ascending: false });

    if (error) {
        console.error('Fetch error:', error.message);
        throw new Error(error.message);
    }

    return (data ?? []) as Transaction[];
}
