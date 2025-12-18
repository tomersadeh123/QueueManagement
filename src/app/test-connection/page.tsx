'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();

        // Test basic connection
        const { data, error } = await supabase.from('businesses').select('count');

        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }

        // Check which tables exist
        const tableNames = ['businesses', 'staff', 'services', 'appointments', 'queue_entries'];
        const existingTables: string[] = [];
        const tableErrors: Record<string, string> = {};

        for (const tableName of tableNames) {
          const { error: tableError } = await supabase.from(tableName).select('count').limit(1);
          if (!tableError) {
            existingTables.push(tableName);
          } else {
            tableErrors[tableName] = tableError.message;
          }
        }

        setTables(existingTables);
        setErrors(tableErrors);
        setStatus('success');
        setMessage('Connected successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === 'loading' && <Loader2 className="animate-spin" />}
              {status === 'success' && <CheckCircle2 className="text-green-600" />}
              {status === 'error' && <XCircle className="text-red-600" />}
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Testing connection to your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Status:</p>
              <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
                {status === 'loading' ? 'Testing...' : status === 'success' ? 'Connected' : 'Connection Failed'}
              </Badge>
            </div>

            {message && (
              <div>
                <p className="font-medium mb-2">Message:</p>
                <p className="text-sm text-slate-600">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <p className="font-medium mb-2">Tables Found ({tables.length}/5):</p>
                <div className="flex flex-wrap gap-2">
                  {tables.map((table) => (
                    <Badge key={table} variant="outline" className="bg-green-50">
                      ✓ {table}
                    </Badge>
                  ))}
                </div>
                {tables.length < 5 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-orange-600">
                      ⚠️ Some tables are missing or inaccessible:
                    </p>
                    {Object.entries(errors).map(([table, errorMsg]) => (
                      <div key={table} className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-sm font-medium text-red-800">✗ {table}</p>
                        <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Troubleshooting:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Check that your .env.local file exists and has the correct values</li>
                  <li>Verify NEXT_PUBLIC_SUPABASE_URL is correct</li>
                  <li>Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is the anon/public key</li>
                  <li>Make sure you ran the database migration SQL</li>
                  <li>Restart the dev server after changing .env.local</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
