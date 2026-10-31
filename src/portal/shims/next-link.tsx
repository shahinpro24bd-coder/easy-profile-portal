import React from "react";
import { useRouter } from "@tanstack/react-router";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

/** Drop-in replacement for next/link backed by TanStack Router history. */
const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link({ href, onClick, target, ...rest }, ref) {
  const router = useRouter();
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (/^(https?:|mailto:|tel:)/.test(href)) return;
        e.preventDefault();
        router.history.push(href);
      }}
      {...rest}
    />
  );
});

export default Link;
