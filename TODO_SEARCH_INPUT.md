# Task: Replace search icon with direct input in Navbar

## Plan
1. Remove `searchOpen` state variable (no longer needed)
2. Remove `AnimatePresence` and conditional rendering
3. Replace the search icon button with a permanent search input field
4. Keep the search icon inside the input as a visual indicator
5. Keep the clear button (X) when there's text
6. Simplify the blur handler
7. Apply changes to both logged-in and non-logged-in sections
8. Match search icon size with profile icon size

## Status: COMPLETED
- [x] Create TODO.md
- [x] Remove `searchOpen` state and `AnimatePresence` logic
- [x] Replace search toggle with permanent input (logged-in section)
- [x] Replace search toggle with permanent input (non-logged-in section)
- [x] Match search icon size (w-6 h-6) with profile icon size (size={24})


