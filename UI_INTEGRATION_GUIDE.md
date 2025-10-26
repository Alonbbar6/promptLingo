# UI Integration Guide

## Quick Start

### Option 1: Use the New Landing Page (Recommended)

Update `client/src/index.tsx`:

```typescript
import AppWithLanding from './AppWithLanding';

root.render(
  <React.StrictMode>
    <AppWithLanding />
  </React.StrictMode>
);
```

This gives you:
- Professional landing page with brand design
- Integrated navigation between landing, translator, and TTS
- All new UI components and brand styling

### Option 2: Keep Existing App, Use Components Individually

Import and use components in your existing pages:

```typescript
import { BrandedButton, BrandedCard, FeatureCard } from './components/ui';
import brandContent from './data/brandContent';

// In your component
<BrandedButton variant="gradient" onClick={handleClick}>
  Click Me
</BrandedButton>

<FeatureCard
  title="Feature Title"
  description="Feature description"
  highlight={true}
/>
```

## Available Components

### 1. BrandedButton
Professional buttons with brand styling.

```typescript
import { BrandedButton } from './components/ui';

<BrandedButton variant="primary" size="md" onClick={handleClick}>
  Primary Button
</BrandedButton>

<BrandedButton variant="gradient" size="lg">
  Gradient Button
</BrandedButton>

<BrandedButton variant="outline" size="sm">
  Outline Button
</BrandedButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'gradient' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- All standard button props (onClick, disabled, etc.)

### 2. BrandedCard
Container component for content sections.

```typescript
import { BrandedCard } from './components/ui';

<BrandedCard 
  title="Card Title"
  subtitle="Card subtitle"
  variant="elevated"
>
  Card content goes here
</BrandedCard>
```

**Props:**
- `title`: Optional title
- `subtitle`: Optional subtitle
- `variant`: 'default' | 'gradient' | 'elevated'

### 3. FeatureCard
Display features with icons and descriptions.

```typescript
import { FeatureCard } from './components/ui';

<FeatureCard
  title="Professional Voice"
  description="Communicate with authority and clarity"
  highlight={true}
/>
```

**Props:**
- `title`: Feature title
- `description`: Feature description
- `icon`: Optional React node for icon
- `highlight`: Boolean to use gradient background

### 4. TestimonialCard
Display user testimonials with ratings.

```typescript
import { TestimonialCard } from './components/ui';

<TestimonialCard
  name="Sofia Rodriguez"
  role="CNA pursuing RN"
  quote="This app changed my life!"
  rating={5}
/>
```

**Props:**
- `name`: User name
- `role`: Optional user role/title
- `quote`: Testimonial text
- `rating`: Optional 1-5 star rating
- `avatar`: Optional avatar URL

### 5. Modal
Reusable modal dialog.

```typescript
import { Modal } from './components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  Modal content goes here
</Modal>
```

**Props:**
- `isOpen`: Boolean to control visibility
- `onClose`: Function to call when closing
- `title`: Optional modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl'

### 6. FAQ
Accordion-style FAQ component.

```typescript
import { FAQ } from './components/ui';
import brandContent from './data/brandContent';

<FAQ items={brandContent.faq} />
```

**Props:**
- `items`: Array of { question: string, answer: string }

## Using Brand Design System

### Colors

```typescript
import brandDesignSystem from './config/brandDesignSystem';

// Access colors
const skyBlue = brandDesignSystem.colors.primary.skyBlue;
const coral = brandDesignSystem.colors.primary.coral;
```

Or use Tailwind classes:

```jsx
<div className="bg-brand-skyBlue text-white">
  <div className="bg-brand-coral">Coral background</div>
  <div className="text-brand-mint">Mint text</div>
</div>
```

### Typography

```jsx
<h1 className="font-serif text-4xl">Heading with serif font</h1>
<p className="font-sans text-base">Body text with sans-serif</p>
```

### Gradient

```jsx
<div className="bg-gradient-brand text-white p-8">
  Content with brand gradient background
</div>
```

### Spacing

```jsx
<div className="p-lg m-xl">
  Content with brand spacing
</div>
```

## Using Brand Content

### Value Propositions

```typescript
import brandContent from './data/brandContent';

brandContent.valueProps.map(prop => (
  <FeatureCard
    key={prop.title}
    title={prop.title}
    description={prop.description}
  />
))
```

### Testimonials

```typescript
brandContent.testimonials.map(testimonial => (
  <TestimonialCard
    key={testimonial.name}
    {...testimonial}
  />
))
```

### FAQ

```typescript
<FAQ items={brandContent.faq} />
```

## Styling Existing Components

Update your existing components to use brand colors:

### Before:
```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### After:
```jsx
<BrandedButton variant="primary" size="md">
  Click Me
</BrandedButton>
```

Or keep your component but use brand colors:

```jsx
<button className="bg-brand-skyBlue text-white px-4 py-2 rounded-lg hover:bg-primary-700">
  Click Me
</button>
```

## Page Layouts

### Full-Width Section with Gradient

```jsx
<section className="bg-gradient-brand text-white py-16">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold mb-4 font-serif">
      Section Title
    </h2>
    <p className="text-lg opacity-90">
      Section content
    </p>
  </div>
</section>
```

### Content Section with Cards

```jsx
<section className="max-w-7xl mx-auto px-4 py-16">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => (
      <BrandedCard key={item.id} title={item.title}>
        {item.content}
      </BrandedCard>
    ))}
  </div>
</section>
```

## Responsive Design

All components are mobile-first and responsive:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

<div className="text-base md:text-lg lg:text-xl">
  {/* Responsive text sizing */}
</div>

<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>
```

## Accessibility

All components include:
- Keyboard navigation
- Focus indicators
- ARIA labels where appropriate
- High contrast colors
- Semantic HTML

Example:

```jsx
<BrandedButton onClick={handleClick}>
  {/* Automatically includes focus ring and keyboard support */}
  Accessible Button
</BrandedButton>
```

## Dark Mode (Future Enhancement)

The design system is prepared for dark mode. To implement:

1. Add dark mode variants to Tailwind config
2. Update components to use dark: prefix
3. Add theme toggle component

```jsx
// Future implementation
<div className="bg-white dark:bg-gray-900 text-neutral-textPrimary dark:text-white">
  Content that adapts to dark mode
</div>
```

## Performance Tips

1. **Import only what you need:**
   ```typescript
   import { BrandedButton } from './components/ui';
   // Not: import * from './components/ui';
   ```

2. **Use Tailwind's purge in production:**
   Already configured in tailwind.config.js

3. **Lazy load the landing page if not needed immediately:**
   ```typescript
   const LandingPage = lazy(() => import('./components/LandingPage'));
   ```

## Customization

### Override Component Styles

```jsx
<BrandedButton 
  variant="primary" 
  className="shadow-2xl transform hover:scale-105"
>
  Custom Styled Button
</BrandedButton>
```

### Extend the Design System

Add to `client/src/config/brandDesignSystem.ts`:

```typescript
export const brandDesignSystem = {
  // ... existing config
  customValues: {
    myCustomColor: '#123456',
    myCustomSpacing: '2.5rem'
  }
};
```

## Troubleshooting

### Components not styled correctly
- Ensure Tailwind is processing the new component files
- Check that `client/tailwind.config.js` includes `"./src/**/*.{js,jsx,ts,tsx}"`

### Colors not working
- Verify Tailwind config has been updated with brand colors
- Rebuild the app: `npm run build`

### TypeScript errors
- All components are TypeScript-ready
- If you see errors, ensure `@types/react` is installed

## Examples

See `client/src/components/LandingPage.tsx` for a complete example of:
- Layout structure
- Component composition
- Brand content integration
- Responsive design
- Accessibility features

## Next Steps

1. Try the landing page: Update index.tsx to use AppWithLanding
2. Explore components: Check out each component in the ui folder
3. Customize: Modify brand colors and content to match your needs
4. Extend: Create new components following the same patterns
5. Test: Ensure everything works on mobile, tablet, and desktop
