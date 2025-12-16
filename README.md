# Property Affordability Planner

A production-quality responsive web app built with Next.js that helps users plan property purchases by calculating loan requirements and monthly savings needed.

## Features

- **Global Financial Parameters**: Set your available cash, target period, currency, and calculation mode
- **Property Management**: Add properties with details including price, interest rate, loan term, and extra costs
- **Automatic Calculations**: 
  - Loan amount needed
  - Monthly mortgage payment
  - Monthly savings required to reach your target
- **Auto-Recalculated Saved Properties**: All saved properties automatically recalculate when global settings change
- **Status Indicators**: Visual status badges (Affordable, Needs Saving, Unaffordable)
- **Local Storage Persistence**: All data is saved locally in your browser

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Persistence**: localStorage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
property-affordability-planner/
├── app/
│   ├── layout.tsx          # Root layout with AppProvider
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── GlobalSettings.tsx  # Financial parameters input
│   ├── PropertyInputForm.tsx # Add/edit property form
│   ├── PropertyList.tsx    # List of saved properties
│   └── PropertyCard.tsx    # Individual property card
├── context/
│   └── AppContext.tsx      # Global state management
├── lib/
│   ├── calculations.ts     # Calculation utilities
│   └── utils.ts            # Helper functions
└── types/
    └── index.ts            # TypeScript type definitions
```

## Design

The app features a clean, modern design inspired by Apple's UI:
- Light grey background (#F4F5F7)
- White cards with rounded corners and subtle shadows
- Green accent color (#16A34A) for important numbers and buttons
- Status pills with color-coded backgrounds
- Fully responsive layout

## Future Enhancements

This app is designed to be easily converted to a mobile app. Components are built with reusability in mind and can be adapted for React Native or other mobile frameworks.
