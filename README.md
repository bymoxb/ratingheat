# RatingHeat — TV Series Episode Heatmap

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Language](https://img.shields.io/badge/Language-Go%20|%20TypeScript-blue.svg)

## Overview

**RatingHeat** is an interactive TV series episode heatmap that visualizes episode ratings across seasons. Search for a series and explore every episode through a color-based visualization powered by the IMDb non-commercial datasets.

This tool transforms complex episode rating data into visual patterns, allowing you to quickly identify trends and quality fluctuations across entire seasons and series. It is ideal for TV enthusiasts, data analysts, and content researchers who want to explore IMDb ratings in a more intuitive and engaging way.

🚀 **Try the live application:** https://ratingheat.illapa.dev/

## Key Features

- 🎬 **Interactive Heatmap Visualization** - Color-coded matrix showing episode ratings across seasons with hover effects
- 📊 **Episode Rating Analysis** - Detailed breakdown of individual episode performance with voting data
- 🔍 **Intelligent Series Search** - Fast autocomplete search to find any TV series from IMDb database
- 🎨 **Genre Classification** - Browse and filter series by genre tags
- 🖼️ **Series Artwork** - Display poster covers with fallback placeholders
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ⚡ **Lightning Fast** - Built with Preact (3KB) and Vite for instant load times
- 🗄️ **Smart Data Import** - Automated ETL pipeline using DuckDB for IMDb metadata processing
- 🌐 **IMDb Integration** - Direct links to IMDb pages for each series

## Technology Stack

### Backend
- **Language**: Go (Golang)
- **Framework**: Gin Web Framework
- **Database**: SQLite
- **Data Processing**: DuckDB (for ETL)
- **Architecture**: Clean Architecture with Domain-Driven Design
- **API**: RESTful HTTP endpoints
- **ORM**: GORM

### Frontend
- **Framework**: Preact with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **CSS Features**: Modern CSS3 with Tailwind utilities
- **State Management**: Preact Hooks
- **Async Operations**: Lodash Debounce

### Data Source
- **Primary**: IMDb Non-Commercial Datasets
- **Data Format**: TSV (Tab-Separated Values) with GZIP compression
- **Supported Types**: TV Series, Episodes, Ratings

### DevOps
- **Containerization**: Docker
- **Deployment**: Container-ready architecture

## Project Structure

```
ratingheat/
├── cmd/                          # Command line applications
│   ├── importer/                # IMDb data importer (DuckDB-based ETL)
│   └── server/                  # Main Gin web server
├── internal/                    # Private application code
│   ├── application/
│   │   └── services/            # Business logic services
│   ├── domain/                  # Domain models and repositories
│   │   ├── episode/
│   │   └── serie/
│   └── infra/                   # Infrastructure layer
│       ├── app/                 # Application setup & routing
│       ├── config/              # Configuration management
│       ├── http/                # HTTP handlers, controllers & DTOs
│       └── persistence/         # SQLite database implementations
├── front/                       # Preact + Vite frontend application
│   ├── src/
│   │   ├── components/          # Reusable Preact components
│   │   ├── hooks/               # Custom Preact hooks
│   │   └── utils/               # Utility functions & formatters
│   └── public/                  # Static assets & favicon
├── dockerfile                   # Multi-stage Docker configuration
├── go.mod                        # Go module dependencies
└── LICENSE                       # MIT License
```

## Quick Start

### Prerequisites

- **Go** 1.18 or higher
- **Node.js** 18+ and pnpm
- **Docker** (optional, for containerized deployment)
- **SQLite** (included with Go SQLite driver)

### Docker Deployment

```bash
# Create the data directory
mkdir -p ./config/ratingheat

# Run the container with environment variables and a persistent volume:
docker run -d \
  --name ratingheat \
  --restart unless-stopped \
  --user "$(id -u):$(id -g)" \
  -e SQLITE_PATH=/data/rating.db \
  -v $(pwd)/config/ratingheat:/data \
  -p 8080:8080 \
  ghcr.io/bymoxb/ratingheat:latest
```

Access the application at `http://localhost:8080`

### Docker Compose

Create a `docker-compose.yml` file in the project root with the following content:

```yaml
services:
  ratingheat:
    image: ghcr.io/bymoxb/ratingheat:latest
    container_name: ratingheat
    restart: unless-stopped
    user: "${UID}:${GID}"
    environment:
      - SQLITE_PATH=/data/rating.db
    volumes:
      - ./config/ratingheat:/data
    ports:
      - 8080:8080
```

Steps to use `docker compose`:

```bash
# Create data directory (if it doesn't exist)
mkdir -p ./config/ratingheat

# Start the service in detached mode
docker compose up -d

# View logs
docker compose logs -f ratingheat

# Stop and remove
docker compose down
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SQLITE_PATH` | ✅ Yes | *(empty)*  | Path to the SQLite database file. |
| `IMPORT_ONSTARTUP` | No | `true` | Whether to run the IMDb importer automatically when the application starts. |
| `DUCKDB_DATABASE` | No | `/tmp/import.duckdb` | Path to the temporary DuckDB database used during imports. |
| `DUCKDB_THREADS` | No | `1` | Number of threads DuckDB can use for processing. |
| `DUCKDB_MEMORY_LIMIT` | No | `512MiB` | Maximum memory available for DuckDB operations. |
| `IMDB_MIN_VOTES` | No | `10000` | Minimum number of IMDb votes required for a TV series to be imported. |
| `IMDB_TITLE_TYPES` | No | `'tvSeries','tvMiniSeries'` | IMDb title types to import (SQL string format). |
| `IMPORTER_PATH` | No | `/app/ratingimporter` | Path to the IMDb importer executable. |
| `IMDB_RATINGS_URL` | No | `https://datasets.imdbws.com/title.ratings.tsv.gz` | URL of the IMDb ratings dataset. |
| `IMDB_BASICS_URL` | No | `https://datasets.imdbws.com/title.basics.tsv.gz` | URL of the IMDb title basics dataset. |
| `IMDB_EPISODE_URL` | No | `https://datasets.imdbws.com/title.episode.tsv.gz` | URL of the IMDb episode dataset. |
| `TRUSTED_PROXIES` | No | `127.0.0.1` | Comma-separated list of trusted reverse proxy IP addresses. |
| `TRUSTED_PLATFORM` | No | *(empty)* | Trusted platform identifier used for internal request validation. |

## Features in Detail

### Heatmap Visualization
The core visualization displays episode ratings as color-coded cells in an interactive table where:
- **Darker colors** (Emerald/Green) indicate higher ratings (9.0+)
- **Lighter colors** (Yellow/Orange) indicate mid-range ratings (7.0-8.0)
- **Red colors** indicate lower ratings (below 6.0)
- Each row represents an episode number
- Each column represents a season
- Hover effects provide visual feedback
- Responsive design for all screen sizes

### Series Management
- Search IMDb database for any TV series with autocomplete
- View complete series information and metadata  
- Display series poster art with fallback placeholder
- Filter and browse series by genre tags
- Quick access to detailed episode breakdowns
- View series year range and IMDb rating with vote count

### Rating Legend
Visual guide showing the color scale and corresponding rating ranges for easy interpretation.

## API Endpoints

The backend provides RESTful API endpoints for:
- Searching and filtering series `/api/series?title=Dark`
- Retrieving serie by id `/api/series/:id`
- Fetching episode ratings and details `/api/series/:id/episodes`

## Configuration

Configuration is managed through environment variables and config files in `internal/infra/config/`. Customize:
- Database connection settings
- Server port and host
- Frontend asset paths
- API rate limiting

## Database

SQLite database with the following main models:
- **Serie** - TV series information and metadata
- **Episode** - Individual episode ratings and details
- **ImportMetadata** - Tracking for data imports

Automatic migrations ensure schema consistency on startup.

## Development

### 1. Clone the Repository

```bash
git clone https://github.com/bymoxb/ratingheat.git
cd ratingheat
```

### 2. Environment Setup

```bash
cp .env.example .env
```


### 3. Backend Setup

```bash
# Install Go dependencies
go mod download

# Generate importer binary
go build -o ratingimporter cmd/importer/main.go

# Run the server
go run cmd/server/main.go
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd front

# Install dependencies
pnpm install

# Start development server
pnpm dev
```


## Performance Optimization

- **Lightweight Framework**: Uses Preact (3KB) instead of React for minimal bundle size
- **Efficient Heatmap Rendering**: Memoized data processing prevents unnecessary re-renders
- **Smart Data Structures**: Hash maps for O(1) episode lookups during rendering
- **Database Optimization**: SQLite with proper indexing for fast queries
- **ETL Pipeline**: DuckDB processes millions of IMDb records efficiently
- **Lazy Loading**: Series data and episodes loaded on-demand
- **CSS Optimization**: Tailwind CSS with purging for production
- **Caching**: Browser caching of API responses with query parameters
- **Compression**: GZIP compression for IMDb dataset downloads

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

Built with Preact (3KB alternative to React) for optimal performance on all modern browsers.

## Troubleshooting

### Database Issues
- Ensure SQLite database file has proper write permissions
- Verify `container_data` directory exists and is writable
- Check that data import completed successfully via logs

### Frontend Not Loading
- Verify frontend build completed successfully with `pnpm build`
- Check browser console (F12) for TypeScript/JavaScript errors
- Ensure backend API is running and accessible at `/api` endpoints
- Clear browser cache if styles appear broken

### Series Search Not Working
- Ensure data import pipeline has completed (check logs for completion message)
- Verify database contains series data: check database file size
- Check browser network tab for failed API requests

### Import/Data Pipeline Failures
- Validate IMDb data source URLs are accessible and not rate-limited
- Check DuckDB memory limit configuration (adjust if needed)
- Review importer logs for detailed error messages and stack traces
- Ensure database migrations completed before data import

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Data Attribution

This project uses **IMDb Non-Commercial Datasets** for all TV series, episode, and rating data.

Poster artwork is fetched at runtime from third-party image providers and is **not distributed with this project**. Image ownership and copyrights remain with their respective owners.


## Acknowledgments

- IMDb for providing TV series and rating data through their non-commercial datasets
- Preact and Vite communities for excellent frameworks and build tools
- Go and Gin communities for powerful backend tools
- Contributors and users who help improve RatingHeat

## SEO Keywords
`RatingHeat` • `TV series heatmap` • `episode ratings` • `IMDb datasets` • `series visualization` • `data visualization` • `React` • `Vite` • `Golang` • `Gin`
