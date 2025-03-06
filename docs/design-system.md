## Marching Band Manager Design System 🎵

### Theme: Modern High School Band Program

### Color Palette 🎨

#### Primary Colors
- School Navy: `#1A237E` (Headers, primary buttons)
- Band Gold: `#FFD700` (Accents, brass instruments)
- Victory Red: `#C62828` (Important actions, alerts)

#### Secondary Colors
- Field Green: `#2E7D32` (Football field)
- Uniform White: `#FFFFFF` (Text, lines)
- Silver Gray: `#9E9E9E` (Secondary text)

#### Instrument Category Colors
- Brass: `#FFD700` (Gold)
- Woodwind: `#98FB98` (Pale Green)
- Percussion: `#FF69B4` (Hot Pink)
- Color Guard: `#BA68C8` (Purple)

### Typography 📝

#### Headers
- Font Family: 'Montserrat', sans-serif
- Section Headers: 24px, School Navy
- Subsection Headers: 20px, School Navy
- Card Headers: 18px, School Navy

#### Body Text
- Font Family: 'Open Sans', sans-serif
- Primary Text: 16px, Dark Gray (`#333333`)
- Secondary Text: 14px, Silver Gray
- Field Labels: 14px, School Navy

### Component Styling 🎨

#### Cards
- Background: White
- Border Radius: 8px
- Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Padding: 24px
- Border: 1px solid `#E0E0E0`

#### Buttons
- Primary:
  - Background: School Navy
  - Text: White
  - Hover: Darker Navy (`#0D1B69`)
  - Border Radius: 6px
  - Padding: 12px 24px

- Secondary:
  - Background: White
  - Border: 2px solid School Navy
  - Text: School Navy
  - Hover: Light Gray Background

- Success/Add:
  - Background: `#4CAF50`
  - Text: White
  - Hover: Darker Green

#### Form Fields
- Input Height: 40px
- Border Radius: 4px
- Border Color: `#E0E0E0`
- Focus Border: School Navy
- Background: White
- Padding: 8px 12px

### Layout Guidelines 📐

#### Navigation
- Fixed top header with school colors
- Left-side navigation for larger screens
- Bottom navigation for mobile
- School logo in top left

#### Main Content Area
- Max width: 1200px
- Padding: 24px
- Background: Light Gray (`#F5F5F5`)

#### Field Display
- Centered in viewport
- Minimum height: 432px (54 yards)
- Minimum width: 800px (100 yards)
- Responsive scaling for smaller screens

### Special Elements 🎺

#### Formation Board
- Field Background: `#2E7D32`
- Yard Lines: White
- Yard Numbers: White, 12px Arial
- Grid Lines: 5-yard intervals
- Member Markers:
  - Size: 12px diameter (3 yard default)
  - Border: 1px solid black
  - Labels: White text below marker

#### Performance Controls
- Play Button: Large, centered
- Timeline: Full width
- Speed Control: Slider with numerical input
- Time Display: Digital clock style

### Responsive Breakpoints 📱

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Animation Guidelines 🎭

- Transitions: 0.2s ease-in-out
- Formation Changes: Smooth linear movement
- Button Hover: Scale 1.05
- Card Hover: Subtle lift (2px up)

### Icons 🎼

- Use music-themed icons where possible
- Instrument icons for member types
- Standard icons for actions (play, pause, etc.)
- Minimum size: 24x24px
- Color: Match text color or specific theme color

### Loading States ⌛

- Primary Loader: Animated musical note
- Background: Semi-transparent white
- Size: 48px
- Color: School Navy

### Error States ⚠️

- Error Text: Victory Red
- Error Cards: Light red background
- Error Icons: Victory Red
- Error Messages: Clear, actionable text

### Success States ✅

- Success Text: `#4CAF50`
- Success Icons: `#4CAF50`
- Success Animations: Subtle scale and fade

This design system emphasizes:
1. School spirit through traditional colors
2. Clear hierarchy and readability
3. Musical and marching band themes
4. Professional but approachable interface
5. Consistent spacing and alignment
6. Accessible color contrasts
7. Responsive design for all devices 