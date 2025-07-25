import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface FunctionStatus {
  name: string;
  status: 'checking' | 'available' | 'unavailable' | 'error';
  error?: string;
  lastChecked?: Date;
}

export default function EdgeFunctionStatus() {
  const [functions, setFunctions] = useState<FunctionStatus[]>([
    { name: 'generate-script', status: 'checking' },
    { name: 'refine-content', status: 'checking' }
  ]);
  const [checking, setChecking] = useState(false);

  const checkFunction = async (functionName: string): Promise<FunctionStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { test: true },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) {
        if (error.message?.includes("FunctionsFetchError") || error.message?.includes("Failed to send a request")) {
          return {
            name: functionName,
            status: 'unavailable',
            error: 'Function not deployed or unreachable',
            lastChecked: new Date()
          };
        } else if (error.status === 404) {
          return {
            name: functionName,
            status: 'unavailable',
            error: 'Function not found',
            lastChecked: new Date()
          };
        } else {
          // For auth errors (401) or other errors, the function exists but returned an error
          return {
            name: functionName,
            status: 'available',
            error: `Function responds but returned: ${error.message}`,
            lastChecked: new Date()
          };
        }
      }

      return {
        name: functionName,
        status: 'available',
        lastChecked: new Date()
      };
    } catch (error: any) {
      return {
        name: functionName,
        status: 'error',
        error: error.message,
        lastChecked: new Date()
      };
    }
  };

  const checkAllFunctions = async () => {
    setChecking(true);
    const results = await Promise.all(
      functions.map(fn => checkFunction(fn.name))
    );
    setFunctions(results);
    setChecking(false);
  };

  useEffect(() => {
    checkAllFunctions();
  }, []);

  const getStatusBadge = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'available':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unavailable':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Edge Function Status
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAllFunctions}
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {functions.map((fn) => (
          <div key={fn.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(fn.status)}
              <div>
                <h4 className="font-medium">{fn.name}</h4>
                {fn.error && (
                  <p className="text-sm text-muted-foreground">{fn.error}</p>
                )}
                {fn.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {fn.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge(fn.status)}
          </div>
        ))}
        
        {functions.some(fn => fn.status === 'unavailable') && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Edge Functions Not Available</h4>
                <p className="text-sm text-amber-700 mt-1">
                  The Supabase Edge Functions are currently unavailable. Please contact support if this issue persists.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
