import { registerCellComponent, registerIcons } from '@forjedio/inertia-table-react';
import { CrownIcon, CopyIcon, SignpostIcon, DatabaseIcon } from 'lucide-react';
import { DatabaseUserDatabases } from '@/components/database-user-databases';

registerIcons({
  // @ts-ignore — inertia-table-react bundles its own React types causing ReactNode version mismatch
  crown: CrownIcon,
  // @ts-ignore
  copy: CopyIcon,
  // @ts-ignore
  signpost: SignpostIcon,
  database: DatabaseIcon,
} as unknown as Parameters<typeof registerIcons>[0]);

registerCellComponent('DatabaseUserDatabases', DatabaseUserDatabases);
