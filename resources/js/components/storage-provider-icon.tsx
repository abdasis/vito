import dropboxUrl from '../../svg/dropbox.svg?url';
import ftpUrl from '../../svg/ftp.svg?url';
import localUrl from '../../svg/local.svg?url';
import s3Url from '../../svg/s3.svg?url';

const storageProviderIcons: Record<string, string> = {
    dropbox: dropboxUrl,
    ftp: ftpUrl,
    sftp: ftpUrl,
    local: localUrl,
    s3: s3Url,
};

interface StorageProviderIconProps {
    provider: string;
    className?: string;
}

const StorageProviderIcon = ({ provider, className = 'size-4' }: StorageProviderIconProps) => {
    const src = storageProviderIcons[provider];
    if (!src) return null;
    return <img src={src} alt={provider} className={className} />;
};

export { StorageProviderIcon };
