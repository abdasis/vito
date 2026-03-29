import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { SharedData } from '@/types';

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
  const page = usePage<SharedData>();
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-muted/60 to-muted/30 p-1 ring-1 ring-foreground/8">
            <div className="overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
              <div className="space-y-2 px-5 py-4 text-center">
                <h1 className="text-xl font-medium">{title}</h1>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
              {children}
            </div>
            <div className="text-muted-foreground/50 px-5 py-3 text-center text-xs">
              VitoDeploy{' '}
              <a
                href={`https://github.com/vitodeploy/vito/releases/tag/${page.props.version}`}
                className="hover:text-primary cursor-pointer"
                target="_blank"
              >
                {page.props.version}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
