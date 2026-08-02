---
name: Orange Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#584237'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#625e56'
  on-tertiary: '#ffffff'
  tertiary-container: '#a09a91'
  on-tertiary-container: '#36322c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#e9e1d8'
  tertiary-fixed-dim: '#ccc5bc'
  on-tertiary-fixed: '#1e1b15'
  on-tertiary-fixed-variant: '#4a463f'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  price-display:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  container-max: 1280px
---

## Brand & Style

The design system is engineered to bridge the gap between a high-energy consumer marketplace and a high-efficiency logistics engine. The brand personality is energetic, reliable, and appetizing, specifically tailored for the burgeoning Pakistani food-tech landscape. 

The visual style follows a **Modern Corporate** aesthetic with **Minimalist** leanings to ensure that high-quality food photography remains the focal point. It utilizes generous whitespace, purposeful color blocking to differentiate between user roles (Customer vs. Admin), and a soft tactile feel through consistent rounding and depth. The emotional response should be one of "effortless hunger satisfaction" for consumers and "precise control" for merchants.

## Colors

The color strategy uses a dual-personality approach:
- **Consumer Interface:** Heavily utilizes the Primary Vibrant Orange and Warm Cream background. The cream base (#FFF7ED) reduces eye strain compared to pure white and makes food imagery appear more "organic" and warm.
- **Admin/Merchant Interface:** Transitions to Deep Charcoal (#1F2937) for navigation and headers, signaling a shift from "discovery mode" to "operational mode."
- **Functional Colors:** Use standard success (Emerald 600), error (Rose 600), and warning (Amber 500) tones, ensuring they maintain enough contrast against both the cream and charcoal backgrounds.

## Typography

This design system pairs the geometric authority of **Montserrat** for headings with the systematic clarity of **Inter** for body and interface text. 

**Currency Formatting:** PKR pricing should always use the "₨" symbol. In consumer views, the price is set in `price-display` (Montserrat Bold) to emphasize value. In admin tables, prices use `body-sm` (Inter) for maximum data density and alignment.

**Hierarchy:** Large display types are reserved for restaurant names and marketing hero sections. Inter is utilized for all transactional elements, ensuring legibility at small sizes during the checkout process or within complex admin dashboards.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Consumer Experience:** Uses a "comfortable" spacing rhythm with `md` (24px) gutters to let food items breathe. Top-level categories use a horizontal scroll on mobile to maximize vertical real estate.
- **Admin Experience:** Uses "compact" spacing. Margins are reduced to `sm` (16px) and gutters to `xs` (8px) within data tables to ensure the user can see more information without excessive scrolling.
- **Breakpoints:** Mobile (up to 767px), Tablet (768px - 1023px), Desktop (1024px+).

## Elevation & Depth

This design system uses **Ambient Shadows** to create a soft, approachable feel. Shadows should never be pure black; they are tinted with the Deep Charcoal primary color at very low opacities to maintain a "clean" look.

- **Level 1 (Resting):** Used for restaurant cards and input fields. `0px 2px 8px rgba(31, 41, 55, 0.05)`.
- **Level 2 (Hover/Active):** Used for active states and floating action buttons. `0px 8px 20px rgba(31, 41, 55, 0.1)`.
- **Level 3 (Overlays):** Used for carts, modals, and dropdowns. `0px 12px 32px rgba(31, 41, 55, 0.15)`.

In the Admin UI, depth is primarily conveyed through **Tonal Layers** (placing white cards on a light grey background) rather than heavy shadows to keep the interface feeling fast and functional.

## Shapes

The shape language is defined by **16px corners** (referenced as `rounded-xl` in this system) for all major container elements.

- **Major Containers:** Restaurant cards, modals, and hero banners use 16px.
- **Action Elements:** Buttons and form inputs use 8px (`rounded-md`) to appear more "clickable" and sturdy.
- **Selection Elements:** Chips and badges use a full pill shape for quick visual scanning.

The consistent 16px radius for food cards creates a "friendly" container that complements the organic shapes found in food photography.

## Components

### Appetite-Appealing Cards
Restaurant cards must have a fixed aspect ratio for imagery (16:9). The card content uses a 16px padding. The title is `headline-sm`, and the sub-info (delivery time, rating) uses `body-sm` with subtle icons.

### Admin Data Tables
Tables in the merchant dashboard utilize a "Zebra Stripe" pattern with a 5% Charcoal tint on alternate rows. Cell padding is tight (12px vertical). Action buttons within tables should be icon-only or small text buttons to preserve space.

### Buttons
- **Primary:** Solid Vibrant Orange with white text. High contrast, 8px radius.
- **Secondary:** Transparent with an Orange border or Warm Cream background for low-priority actions.
- **Admin Primary:** Deep Charcoal with white text.

### Input Fields
Inputs use a white background with a 1px border (#E5E7EB). On focus, the border transitions to Vibrant Orange with a 2px outer glow. Labels are always positioned above the field in `label-md`.

### PKR Pricing Display
Pricing should always be bold. In the checkout flow, the "Total" uses the Primary Orange color to draw the eye to the final conversion point.