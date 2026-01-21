import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Generate Professional Receipts in Seconds
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create, customize and share digital receipts with QR codes. 
          Perfect for small businesses and anyone needing quick receipt generation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/receipt">
            <Button size="lg">Create Your First Receipt</Button>
          </Link>
          <Button size="lg" variant="outline">View Sample Receipt</Button>
        </div>
      </section>
    </main>
  );
}