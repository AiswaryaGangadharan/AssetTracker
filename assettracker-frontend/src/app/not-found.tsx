import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <Card className="max-w-md w-full shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">404</CardTitle>
          <CardDescription className="text-lg">
            Page not found. The page you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="w-full sm:w-auto">Go to Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">Dashboard</Button>
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <Link href="/" className="hover:text-primary transition-colors">← Back to Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

