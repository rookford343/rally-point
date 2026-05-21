# Privacy Policy

Rally Point stores all data locally on your device. Nothing is transmitted to any server.

---

## What is stored

**Standard plan data** is stored in your browser's `localStorage` under the key `rally-point-plan-v1`. This includes:

- Family unit names, addresses, and member information
- Pet details
- Vehicle information (type, fuel type, range, capacity)
- Rally point addresses and resource inventories
- Communication plan (FRS channels, out-of-state coordinator contact)
- Departure signal protocol
- Family passphrase
- Away-from-home protocols
- Supply inventory (have/need status per item)

**Sensitive inventory data** (firearms and defensive equipment) is stored separately under the key `rally-point-sensitive-v1`. This key is intentionally excluded from all standard print and export functions. It is stored only in `localStorage` and is never transmitted.

---

## What is NOT stored

- No account or login information (there is no account system)
- No analytics or usage tracking
- No location data beyond what you manually enter as addresses
- No biometric data

---

## Where your data goes

Nowhere. The app is a static site hosted on GitHub Pages. There is no backend server, no API, and no database. All computation happens in your browser.

The only external requests the app makes are:
- Loading the app itself from GitHub Pages on first visit
- Caching assets via the PWA service worker for offline use

After the first load, the app works entirely offline.

---

## How to delete your data

**Delete everything (standard plan):**

Open your browser's developer tools (F12), go to **Application → Local Storage**, find your app's domain, and delete the `rally-point-plan-v1` key.

Or in the browser console:
```javascript
localStorage.removeItem('rally-point-plan-v1')
```

**Delete sensitive inventory:**
```javascript
localStorage.removeItem('rally-point-sensitive-v1')
```

**Delete everything and start over:**
```javascript
localStorage.clear()
```

---

## Printed output

When you print your plan, it is printed locally on your device. Rally Point does not transmit print data anywhere. Be thoughtful about where you store printed copies — they contain your home address, contact information, and security protocols.

The sensitive inventory section is intentionally printed as a separate document and should be stored separately from the main binder.

---

## Children's information

If you enter children's names and ages as part of your family plan, that data is subject to the same local-only storage described above. No children's information is transmitted or processed by any external service.

---

## Changes to this policy

This file is part of the open-source repository. Any changes to privacy practices would be visible in the git history and would require a code change — not just a policy update.
