import awsUrl from '../../svg/aws.svg?url';
import customUrl from '../../svg/custom.svg?url';
import digitaloceanUrl from '../../svg/digitalocean.svg?url';
import hetznerUrl from '../../svg/hetzner.svg?url';
import linodeUrl from '../../svg/linode.svg?url';
import vultrUrl from '../../svg/vultr.svg?url';

const providerIcons: Record<string, string> = {
    aws: awsUrl,
    custom: customUrl,
    digitalocean: digitaloceanUrl,
    hetzner: hetznerUrl,
    linode: linodeUrl,
    vultr: vultrUrl,
};

interface ProviderIconProps {
    provider: string;
    className?: string;
}

const ProviderIcon = ({ provider, className = 'size-4' }: ProviderIconProps) => {
    const src = providerIcons[provider];
    if (!src) return null;
    return <img src={src} alt={provider} className={className} />;
};

export { ProviderIcon };
