# TripShare Navbar Audit

## 1. Current Navbar structure
The Navbar is located in `client/src/components/shared/Navbar.jsx`. It currently uses a mix of Bootstrap structure (`navbar navbar-expand-lg`) and custom React state-driven Framer Motion logic. It has a Desktop section and a Mobile full-width dropdown section (`isMobileMenuOpen`).

## 2. Desktop layout
The desktop layout works cleanly using `.d-none .d-lg-flex`. It contains:
- Left: Logo + TripShare title.
- Right: Navigation links (Home, Discover, Blogs, About, Features, Contact), Notification Bell, Profile Avatar / Login Button.
- The active state is indicated using a framer motion `layoutId="nav-indicator"` (yellow underline).

## 3. Mobile layout
Below `lg`, it uses a hamburger toggle. Clicking it activates a full-width overlay taking `calc(100dvh - 68px)` with a backdrop blur. The layout is a vertical list, recently modified to contain Home, Discover, Blogs, About, Features, Contact, Notifications, and Profile/Login.

## 4. Tablet behavior
Currently driven by Bootstrap's `.navbar-expand-lg` which implies the mobile menu kicks in around 992px (`lg`). Desktop is shown at >= 992px, Mobile at < 992px.

## 5. Authentication-dependent items
`user` state determines if the Profile avatar and Notification badge are shown on Desktop. On mobile, `user` switches the bottom item between `Profile` and `Login`. The logic uses `localStorage.getItem("token")` and `window.addEventListener("auth-expired")`.

## 6. Existing notification logic
Uses `fetchNotifications()` hitting `/notifications` API. Returns `unreadCount`. On desktop and mobile, it's currently a bell emoji `🔔` with an absolute positioned badge.

## 7. Existing profile route
Clicking profile on mobile goes to `/profile`. Desktop uses a dropdown containing `/profile`, `/saved-trips`, `/settings`, and `Logout`.

## 8. Existing icon system
- `lucide-react` is installed (`Menu`, `X` are used).
- Some places use emoji (e.g., `🔔`, `👤`, `🔖`, `⚙️`, `🚪`).
- `react-icons` is also installed.
We must standardise to use `lucide-react` for all icons across the board for visual consistency.

## 9. Existing animation system
Framer Motion is used heavily (`<motion.div>`, `<AnimatePresence>`).
Menu container expands with `height` and `opacity`.
Items stagger in with `y` and `opacity`.
Hamburger/X transition uses `rotate` and `scale`.

## 10. Existing responsive breakpoints
Controlled mostly by Bootstrap classes (`d-lg-none`, `d-lg-flex`) which correspond to Bootstrap's breakpoints (`lg` = 992px). Tailwind is also installed but currently mostly uses inline styling and some custom utility classes.

## 11. Current spacing problems
- Icons (emojis) and text alignment might be slightly off.
- Vertical space in the mobile menu is quite spaced out; we should standardise touch targets to 44px minimum with consistent spacing and clear dividers.

## 12. Current overflow problems
- None observed at the moment, but the desktop profile dropdown used to overflow right before being adjusted to `end-0`. The mobile overlay sits perfectly under the 68px header.

## 13. Current navigation behavior
Navigating updates the `location` hook which triggers `useEffect` to close `isMobileMenuOpen` and remove `overflow-y: hidden` from body. Uses `react-router-dom` `<Link>`.
