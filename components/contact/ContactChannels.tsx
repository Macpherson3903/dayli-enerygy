import Link from "next/link";
import type { ContactChannel } from "@/lib/content/contact";
import { contactChannels, contactHours } from "@/lib/content/contact";
import { Card } from "@/components/ui/Card";

function ChannelRow({ channel }: { channel: ContactChannel }) {
  const body = channel.href ? (
    <Link
      href={channel.href}
      className="text-sm font-medium text-brand-800 hover:text-brand-900 underline-offset-2 hover:underline"
    >
      {channel.value}
    </Link>
  ) : (
    <p className="text-sm font-medium text-gray-900">{channel.value}</p>
  );

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {channel.label}
      </p>
      <div className="mt-1">{body}</div>
      {channel.hint && (
        <p className="mt-1 text-xs text-gray-500">{channel.hint}</p>
      )}
    </div>
  );
}

export function ContactChannels() {
  return (
    <Card className="h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Other ways to reach us
      </h2>
      <div className="flex flex-col gap-4">
        {contactChannels.map((c) => (
          <ChannelRow key={c.label} channel={c} />
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
        {contactHours}
      </p>
      <p className="mt-4 text-xs text-gray-500">
        Prefer to browse first?{" "}
        <Link
          href="/shop"
          className="font-medium text-brand-800 hover:text-brand-900 underline-offset-2 hover:underline"
        >
          Visit the shop
        </Link>
        .
      </p>
    </Card>
  );
}
