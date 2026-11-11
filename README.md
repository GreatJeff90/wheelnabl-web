# Wheelnabl Estate Mobility

Wheelnabl is a smart, intra-estate electric vehicle transit system specifically designed for Golf Estate. It bridges the mobility gap within the estate, providing residents with a seamless, eco-friendly way to move between zones, gates, and residential blocks.

## 🚀 Key Features

- **Driver Cockpit**: High-performance real-time dispatch radar with live trip notifications.
- **Real-time Notifications**: Integrated Web Audio API for audible dispatch chimes and Browser Push API for background ride alerts.
- **Resident App**: Simple booking interface for shuttles and private EV units with a built-in credit wallet.
- **Fleet Management**: Live presence tracking for EV units across estate sectors.
- **PWA (Progressive Web App)**: Install Wheelnabl directly to your device (Android, iOS, or Desktop) for a native app-like experience.
- **Security First**: Integrated security PIN verification for estate barrier clearance.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/greatpam20-blip/wheelnabl-web.git
   cd wheelnabl-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 PWA Support

Wheelnabl is fully PWA-compliant. On mobile devices, use the "Add to Home Screen" prompt to install the app for:
- Full-screen standalone mode.
- Improved performance.
- Background push notifications for drivers.

## ⚖️ License

Private project for Wheelnabl Estate Mobility. All rights reserved.
