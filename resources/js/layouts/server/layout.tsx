import { ReactNode, useEffect } from 'react';
import { Server } from '@/types/server';
import ServerHeader from '@/pages/servers/components/header';
import Layout from '@/layouts/app/layout';
import { usePage } from '@inertiajs/react';
import { Site } from '@/types/site';
import siteHelper from '@/lib/site-helper';

const ServerLayout = ({ children }: { children: ReactNode }) => {
  const page = usePage<{
    server: Server;
    site?: Site;
  }>();

  const storedSite = siteHelper.getStoredSite();

  useEffect(() => {
    if (storedSite && storedSite.server_id !== page.props.server.id) {
      siteHelper.storeSite(undefined);
    }
  }, [page.props.server.id, storedSite]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Layout>
      <ServerHeader server={page.props.server} site={page.props.site} />

      <div>{children}</div>
    </Layout>
  );
};

export default ServerLayout;
