# Device Catalog Web App

[![CI](https://github.com/hossain-khan/device-catalog-webapp/workflows/CI/badge.svg)](https://github.com/hossain-khan/device-catalog-webapp/actions)

A modern, responsive device catalog application built with React, TypeScript, and Tailwind CSS. Browse, filter, and compare Android devices with an intuitive interface.

## 🚀 Features

- **Device Browsing**: View comprehensive Android device specifications
- **Advanced Filtering**: Filter by manufacturer, form factor, RAM, SDK version, and more
- **Device Comparison**: Compare multiple devices side-by-side
- **Data Management**: Upload custom device data via JSON files
- **Export Functionality**: Export filtered results and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Performance Optimized**: Virtual scrolling for large datasets

## 🛠️ Development

### Prerequisites
- Node.js 20.x or 22.x (LTS versions)
- npm

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/hossain-khan/device-catalog-webapp.git
   cd device-catalog-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Architecture

This project was originally built using GitHub Spark but has been refactored to use standard web technologies:

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for data visualization
- **Icons**: Phosphor Icons
- **Storage**: LocalStorage for persistence

## 📦 Recent Changes

- **Removed GitHub Spark Dependency**: Replaced with local implementations
- **Added CI/CD**: Automated testing and builds via GitHub Actions
- **Icon Fixes**: Updated to compatible Phosphor icon names
- **Local Storage**: Custom `useKV` hook for data persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
