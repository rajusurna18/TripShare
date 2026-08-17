# TripShare Navbar Implementation Plan

## Goal
Implement a refined, polished Navbar integrating a consistent `lucide-react` icon system, precise spacing, refined framer-motion animations, and strict adherence to the TripShare gold/dark theme without breaking existing logic.

## Proposed Changes

### A. Icon System Integration
We will replace all emoji icons with `lucide-react` icons for uniformity.
Mapping:
- **Home**: `Home`
- **Discover**: `Compass`
- **Blogs**: `FileText`
- **About**: `Info`
- **Features**: `Sparkles`
- **Contact**: `Phone`
- **Notifications**: `Bell`
- **Profile**: `User`
- **Login**: `LogIn`
- **Logout**: `LogOut` (for desktop dropdown)
- **Saved Trips**: `Bookmark`
- **Settings**: `Settings`

All mobile icons will be contained in a fixed-width wrapper (`24px`) to ensure perfect vertical text alignment. Icon size will be standard `20px`.

### B. Mobile Menu Structure & Styling
- Implement the requested Dividers using `<hr className="border-secondary opacity-25 my-3" />`.
- Touch targets strictly maintained at >= 44px padding/height.
- The structure will precisely follow:
  1. Primary Nav (Home, Discover, Blogs, About, Features, Contact)
  2. Divider
  3. Notifications
  4. Divider
  5. Profile (if logged in) or Login (if logged out).

### C. Active Navigation State
- Mobile active items will receive a subtle background (`rgba(255,193,7, 0.1)`) and gold text color (`#ffc107`), mirroring the Desktop indicator.
- Desktop active state remains the yellow framer-motion underline.

### D. Animations & Timing
- **Menu Container**: `250ms` height + opacity fade.
- **Hamburger to X**: `250ms` cross-rotation.
- **Item Stagger**: `40-60ms` stagger delay. Items slide in `y: 15px -> 0`.
- **Interactions**: Mobile links scale `0.98` on active tap. Desktop links have a slight background shift on hover.

### E. Responsive & Tablet Checks
- Continue using `lg` (992px) as the breakpoint.
- Remove hardcoded width constraints that could cause tablet overlap.

### F. Accessibility & Environment
- Ensure `aria-labels` are comprehensive.
- Add `prefers-reduced-motion` check for Framer Motion (`useReducedMotion` hook) to disable staggered `y` animations if the user has requested it, replacing them with simple opacity fades.

## Verification Plan
1. Ensure the build succeeds (`npm run build`).
2. Test responsive layouts from mobile to 1920px desktop.
3. Test authentication toggles.
4. Verify routing.
5. Provide detailed check across mobile, tablet, and desktop viewports in `navbar_final_verification.md`.
