# Todo List - Fix Navbar Layout Shift

## Task: Make navigation items (pencarian, home, coffeeshop, kategori, tentang kami) not shift when clicked

### Changes implemented:
- [x] Restructure navbar with 3-column flex layout: logo (left), nav (center), actions (right)
- [x] Logo section: fixed width with flex-shrink-0
- [x] Navigation section: flex-1 to take remaining space and stay centered
- [x] Right side section: fixed width with flex-shrink-0
- [x] Move search icon next to profile/login button
- [x] Change search animation to expand to the left

### File edited:
- `/Users/hilmiirfani/Documents/SMESTER 5/MPTI/CUPPAPLACE/cuppa-place/frontend/src/components/Navbar.tsx`

### Summary of changes:
1. Changed navbar layout to use 3-column structure:
   - Left: Logo (fixed width, won't shrink)
   - Center: Navigation links (flex-1, always centered)
   - Right: Search + Profile/Login (fixed width, won't shrink)

2. Search button moved next to profile/login button

3. Search input expands LEFT toward the profile button, not pushing nav items

This ensures the middle navigation items stay perfectly centered regardless of search state.

