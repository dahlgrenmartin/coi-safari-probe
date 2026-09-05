# coi-safari-probe

Throwaway probe. Answers one question: does WebKit honour `Cross-Origin-Opener-Policy`
and `Cross-Origin-Embedder-Policy: require-corp` when they arrive on a
service-worker-generated navigation response?

GitHub Pages cannot set response headers, so for PrometheOS the service worker is the
only delivery mechanism. Safari has never supported `COEP: credentialless`, which is
what the stack ships today — hence the degraded mode on iOS. If `require-corp` works
here, that degradation is fixable; if it does not, no header choice helps and the
answer is a host that can serve real headers.

Open on the device under test. Delete this repo once the question is answered.
