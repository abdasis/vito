import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';
import { SharedData } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Vito';

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup: ({ App, props }) => {
      const ziggy = (props.initialPage.props as unknown as SharedData).ziggy;

      (global as typeof globalThis & { route: typeof route }).route = (name: RouteName, params?, absolute?) =>
        route(name, params, absolute, {
          ...ziggy,
          location: new URL(ziggy.location),
        });

      return <App {...props} />;
    },
  }),
);
