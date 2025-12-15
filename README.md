# CapThat! 🎯

**Capture. Compare. Create.**

CapThat! is a Chrome extension that allows you to quickly capture images en masse and place them onto an exportable mood-board. Great for building brand inspiration, quick comparisons for online shopping, and bulk image capture.

## Features ✨

- **Bulk Image Scraping**: Easily scrape and download images from any website, including popular platforms like Instagram, Facebook, Pinterest, Twitter, and more
- **Smart Filtering**: Filter images by URL, alt text, or title
- **Selective Downloads**: Choose which images you want to download
- **Bulk Download**: Download all selected images at once
- **Image Information**: Check the size and dimensions of each image
- **Copy URLs**: Quickly copy the URL of any original image
- **Beautiful UI**: Modern, minimal interface with CapThat! brand styling

## Installation 🚀

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Chrome browser

### Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd capthat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Google Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `out` folder from this project

## Development 🔧

### Run Development Server

To run the extension in development mode:

```bash
npm run dev
```

This will start the Next.js development server at `http://localhost:3000/` (useful for testing the UI).

### Build for Production

To build the extension for production:

```bash
npm run build
```

This will:
- Build the Next.js application
- Export static files to the `out` directory
- Fix paths for Chrome extension compatibility
- Copy necessary files (background.js, manifest.json, etc.)

## Usage 📖

1. **Navigate to any webpage** with images you want to capture
2. **Click the CapThat! extension icon** in your Chrome toolbar
3. **Browse the scraped images** in the popup window
4. **Filter images** using the search bar (by URL, alt text, or title)
5. **Select images** by clicking the checkboxes
6. **Download individually** by clicking "Cap!" on any image
7. **Download in bulk** by selecting multiple images and clicking "Download Selected"
8. **Copy image URLs** by clicking "Copy URL" on any image

All downloaded images will be saved to the `capture` folder in your default downloads directory.

## Project Structure 📁

```
capthat/
├── components/          # React components
│   └── CapThatPopup/   # Main popup UI component
├── pages/              # Next.js pages
│   ├── _app.js         # App wrapper
│   └── index.js        # Main popup page
├── public/             # Static files (copied to out/)
│   ├── background.js   # Service worker for downloads
│   ├── inject.js       # Content script for image scraping
│   ├── manifest.json   # Chrome extension manifest
│   └── icons/          # Extension icons
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS imports
├── capture/            # Downloaded images folder
├── out/                # Built extension (generated)
└── package.json        # Dependencies and scripts
```

## Tech Stack 🛠️

- **Next.js** - React framework
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Chrome Extension APIs** - For browser integration

## Brand Identity 🎨

CapThat! uses a modern, creator-friendly design:

- **Colors**: Midnight Navy (#0F172A), Electric Teal (#2DD4BF), Soft Sand (#F8FAFC), Accent Coral (#FB7185)
- **Typography**: Inter font family
- **Style**: Minimal, fast, visual, organized

## Permissions 🔐

CapThat! requires the following permissions:

- `tabs` - To access the current tab and scrape images
- `scripting` - To inject content scripts
- `storage` - To store extension data
- `downloads` - To download captured images
- `activeTab` - To access the active tab's content

## Contributing 🤝

Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License 📄

MIT License - see LICENSE file for details

---

**CapThat!** - See it all at once. ✨
