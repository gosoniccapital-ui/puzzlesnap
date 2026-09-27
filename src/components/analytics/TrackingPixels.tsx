"use client";

import Script from "next/script";
import {
  GA_TRACKING_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  X_PIXEL_ID,
  X_CONVERSION_EVENT_ID,
  RAKUTEN_AUTOMATE_KEY,
  RAKUTEN_U1,
} from "@/lib/analytics/pixel-config";

export {
  GA_TRACKING_ID,
  FB_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  X_PIXEL_ID,
  X_CONVERSION_EVENT_ID,
  RAKUTEN_AUTOMATE_KEY,
  RAKUTEN_U1,
};

export default function TrackingPixels() {
  return (
    <>
      {/* 1. Google Analytics 4 (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* 2. Meta (Facebook) Pixel */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* 3. TikTok Pixel */}
      <Script
        id="tiktok-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=o||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }(window, document, 'ttq');
          `,
        }}
      />

      {/* 4. X (Twitter) Conversion Tracking */}
      <Script
        id="x-conversion-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${X_PIXEL_ID}');
            twq('event', '${X_CONVERSION_EVENT_ID}', {
              conversion_id: null
            });
          `,
        }}
      />

      {/* 5. Rakuten Automate (LinkSynergy Dynamic Affiliate Tracking) */}
      {RAKUTEN_AUTOMATE_KEY && (
        <Script
          id="rakuten-automate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined" && !window._rakuten_automate) {
                var _rakuten_automate = {
                  u1: ${JSON.stringify(RAKUTEN_U1 || "")},
                  snippetURL: "https://automate-frontend.linksynergy.com/minified_logic.js",
                  automateURL: "https://automate.linksynergy.com",
                  widgetKey: ${JSON.stringify(RAKUTEN_AUTOMATE_KEY)},
                  aelJS: null,
                  useDefaultAEL: false,
                  loaded: false,
                  events: []
                };
                window._rakuten_automate = _rakuten_automate;
                var ael = window.addEventListener;
                window.addEventListener = function(a, b, c, d) {
                  "click" !== a && _rakuten_automate.useDefaultAEL
                    ? ael(a, b, c)
                    : _rakuten_automate.events.push({ type: a, handler: b, capture: c, rakuten: d });
                };
                _rakuten_automate.links = {};
                var httpRequest = new XMLHttpRequest();
                httpRequest.open("GET", _rakuten_automate.snippetURL, true);
                httpRequest.timeout = 5000;
                httpRequest.ontimeout = function() {
                  if (!_rakuten_automate.loaded) {
                    for (var i = 0; i < _rakuten_automate.events.length; i++) {
                      var a = _rakuten_automate.events[i];
                      ael(a.type, a.handler, a.capture);
                    }
                    _rakuten_automate.useDefaultAEL = true;
                  }
                };
                httpRequest.onreadystatechange = function() {
                  if (httpRequest.readyState === XMLHttpRequest.DONE && 200 === httpRequest.status) {
                    eval(httpRequest.responseText);
                    _rakuten_automate.run(ael);
                  }
                };
                httpRequest.send(null);
              }
            `,
          }}
        />
      )}
    </>
  );
}
