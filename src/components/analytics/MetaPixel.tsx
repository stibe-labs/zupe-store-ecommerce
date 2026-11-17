"use client";

import React, { useEffect, useState, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { META_PIXEL_ID, isPixelTrackingAllowed, trackPageView } from "@/lib/metaPixel";

function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPixelTrackingAllowed()) return;
    // Fire PageView on every route change across the application
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    setIsAllowed(isPixelTrackingAllowed());
  }, []);

  // Completely omit Meta Pixel on admin.zupestore.in, *.workers.dev, or /admin
  if (!isAllowed) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code (with strict runtime exclusion) */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (
              window.location.hostname === 'admin.zupestore.in' ||
              window.location.hostname.indexOf('admin.') === 0 ||
              window.location.hostname.indexOf('workers.dev') !== -1 ||
              window.location.pathname.indexOf('/admin') === 0
            ) {
              /* Meta Pixel completely disabled on admin domain, preview workers.dev, and admin routes */
            } else {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            }
          `,
        }}
      />

      {/* NoScript Fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Route Change Tracker (fires PageView on SPA page navigation) */}
      <Suspense fallback={null}>
        <MetaPixelRouteTracker />
      </Suspense>
    </>
  );
}
