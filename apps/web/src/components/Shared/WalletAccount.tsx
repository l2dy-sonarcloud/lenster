import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { DEFAULT_AVATAR } from "@hey/data/constants";
import formatAddress from "@hey/helpers/formatAddress";
import { Image } from "@hey/ui";
import { chains } from "@lens-network/sdk/viem";
import Link from "next/link";
import type { FC } from "react";
import useEnsName from "src/hooks/useEnsName";
import type { Address } from "viem";
import Slug from "./Slug";

interface WalletAccountProps {
  address: Address;
}

const WalletAccount: FC<WalletAccountProps> = ({ address }) => {
  const { ens, loading } = useEnsName({
    address,
    enabled: Boolean(address)
  });

  const displayName = loading
    ? formatAddress(address)
    : ens || formatAddress(address);

  return (
    <div className="flex items-center justify-between">
      <Link
        className="flex items-center space-x-3"
        href={`${chains.testnet.blockExplorers?.default.url}/address/${address}`}
        rel="noreferrer noopener"
        target="_blank"
      >
        <Image
          alt={address}
          className="size-10 rounded-full border bg-gray-200"
          height={40}
          src={DEFAULT_AVATAR}
          width={40}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <div>{displayName}</div>
            <ArrowTopRightOnSquareIcon className="size-4" />
          </div>
          <Slug className="text-sm" slug={formatAddress(address)} />
        </div>
      </Link>
    </div>
  );
};

export default WalletAccount;
