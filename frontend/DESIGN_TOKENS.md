# Orange design tokens

Source: [Orange Figma file](https://www.figma.com/design/IWfnrletf8gzrCJYYfHroo/Orange?node-id=0-1). The file has no local Figma Variables, Paint Styles, Text Styles, or Effect Styles; these implementation tokens are therefore a direct transcription of values applied in the target screens, not approximated values.

## Colour

| Token family | Exact Figma values | Seen on |
| --- | --- | --- |
| `orange` | `950 #341100`, `900 #582200`, `800 #9D4300`, `500 #F97316`, `200 #FFDBCA`, `100 #FFB690` | Home, Menu, Admin Dashboard |
| `neutral` | `ink #151C27`, `slate #3D4756`, `muted #596373`, `gray #6B7280`, `warm #8C7164`, `copy #584237`, `canvas #F9F9FF`, `soft #F0F3FF`, `lavender #E7EEFE`, `blue #E2E8F8`, `border #DCE2F3`, `borderStrong #D6E0F3`, `white #FFFFFF` | Home and Menu; `copy`, `white`, and select neutrals also appear in Admin |
| `admin` | `base #0A0F16`, `surface #111823`, `raised #1A212C`, `panel #1E2632`, `border #2A313D`, `text #F9F9FF`, `muted #BDC7D9`, `subdued #A09A91`, `warm #CCC5BC` | Admin Dashboard – Desktop |
| status | `success #22C55E/#4ADE80`, `danger #EF4444/#F87171/#BA1A1A`, `warning #EAB308`, `info #3B82F6/#60A5FA` | Home and Admin Dashboard |

The Figma screens also use alpha variants directly: orange at 10%, 20%, 60%, and 80%; white at 0.2%, 2%, 3%, 5%, 40%, 90%, and 95%; warm neutral at 5%, 10%, and 20%; and admin-border at 10% and 20%.

## Typography

`font-sans` is **Inter**; `font-display` is **Montserrat**. Both families are loaded in `styles/globals.css`.

| Tailwind token | Exact size / line height / tracking | Family | Seen on |
| --- | --- | --- | --- |
| `text-display-lg` | 48px / 60px / -0.96px | Montserrat | Customer Home – Desktop |
| `text-display-sm` | 32px / 40px / -0.64px | Montserrat | Customer Home – Mobile |
| `text-heading-xl` | 28px / 24px | Montserrat | Admin Dashboard – Desktop |
| `text-heading-lg` | 24px / 32px | Montserrat | Home, Menu, Admin Dashboard – Mobile |
| `text-heading-md` | 20px / 28px | Montserrat | Home, Menu, Admin Dashboard |
| `text-heading-sm` | 16px / 24px | Montserrat | Home |
| `text-body-lg` | 18px / 28px | Inter | Customer Home – Desktop |
| `text-body` | 16px / 24px | Inter | Home and Admin Dashboard |
| `text-body-sm` | 14px / 20px | Inter | Home, Menu, Admin Dashboard |
| `text-caption` | 12px / 18px | Inter | Home and Menu |
| `text-overline` | 10px / 15px / 0.5px | Inter | Menu |
| `text-admin-label` | 11px / 16.5px / 1.1px | Inter | Admin Dashboard – Mobile |

## Spacing and radii

The repeated Figma spacing values are `0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 128px`, exposed as Tailwind spacing keys `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 32`. These values recur as frame padding and auto-layout gaps on Home, Menu, and Admin Dashboard. Decimal measurements in the canvas are layout-result positions rather than reusable spacing values and are intentionally not tokens.

| Radius token | Exact Figma value | Seen on |
| --- | --- | --- |
| `rounded-none` | 0px | all target screens |
| `rounded-sm` | 4px | Home, Menu, Admin Dashboard – Desktop |
| `rounded-md` | 6px | Admin Dashboard – Desktop |
| `rounded-lg` | 8px | all target screens |
| `rounded-xl` | 12px | all target screens |
| `rounded-2xl` | 16px | Home |
| `rounded-full` | 9999px | all target screens |

## Effects

| Token | Exact Figma shadow | Seen on |
| --- | --- | --- |
| `shadow-subtle` | `0 1px 2px rgb(0 0 0 / 5%)` | Home, Menu, Admin Dashboard |
| `shadow-card` | `0 2px 8px rgb(31 41 55 / 5%)` | Home and Menu |
| `shadow-float` | `0 4px 6px -4px rgb(0 0 0 / 10%), 0 10px 15px -3px rgb(0 0 0 / 10%)` | Home and Menu |
| `shadow-header` | `0 -4px 12px rgb(31 41 55 / 8%)` | Home and Menu |
| `shadow-overlay` | `0 8px 20px rgb(31 41 55 / 10%)` | Menu |
| `shadow-menu` | `0 25px 50px -12px rgb(0 0 0 / 25%)` | Menu – Mobile |
| `shadow-admin` | `0 2px 8px rgb(0 0 0 / 20%)` | Admin Dashboard – Desktop |
| `shadow-drawer` | `-4px 0 12px rgb(0 0 0 / 50%)` | Admin Dashboard – Mobile |
| `shadow-focus` | `0 0 0 2px #2A313D` | Admin Dashboard – Mobile |

Figma additionally applies background blur at 4px (Home), 12px (Menu – Desktop), and 8px (Admin Dashboard – Mobile); these are not box shadows and should be applied with Tailwind's arbitrary `backdrop-blur-[...]` utilities when needed.
