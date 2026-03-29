import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Server } from '@/types/server';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const SyncDatabases = ({ server }: { server: Server }) => {
  const [open, setOpen] = useState(false);
  const form = useForm();

  const submit = () => {
    form.patch(route('databases.sync', server.id), {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCwIcon />
          <span className="hidden lg:block">Sync</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Sync Databases</DialogTitle>
              <DialogDescription>Sync databases from the server to Vito</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="p-5">
            <p className="text-sm text-muted-foreground">Are you sure you want to sync the databases from the server to Vito?</p>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={form.processing} onClick={submit}>
              {form.processing && <LoaderCircleIcon className="animate-spin" />}
              Sync
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncDatabases;
