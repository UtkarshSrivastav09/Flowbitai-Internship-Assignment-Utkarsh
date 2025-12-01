<h1> 🌍 GIS Mapping Application – AOI Drawing & WMS Viewer</h1>

This project is a GIS-based web application that allows users to visualize WMS map layers, draw Areas of Interest (AOIs), export/import spatial data, and persist features locally. The goal was to match the provided UI design accurately while ensuring scalability for thousands of polygons.

---

<h1>🚀 Tech Stack</h1>

| Category | Tools Used |
|---------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Mapping | OpenLayers (or Leaflet — update if needed) |
| Testing | Playwright |
| Language | JavaScript/TypeScript |

---

<h1>🔧 Setup & Installation</h1>

```bash
git clone <repo-url>
cd <project-folder>
npm install
npm run dev
```

The app will run at:
```
http://localhost:5173/
```

---


<h1>🗺 Map Library Choice</h1>

I selected **OpenLayers** because it provides:

✔ Strong WMS/WFS support  
✔ High performance with large GeoJSON datasets  
✔ Built-in drawing/editing tools  
✔ Better control over projections and CRS  

### Alternatives I considered
| Library | Why rejected |
|--------|-------------|
| Leaflet | Limited performance with heavy vector rendering |
| Mapbox GL | Expensive for commercial use + licensing concerns |
| Google Maps API | Proprietary + no WMS layer support |

---

<h1>🧠 Architecture Decisions</h1>

```
src/
 ├─ components/        → UI components (Navbar, Sidebar, MapControls)
 ├─ map/               → Map service, interaction handlers
 ├─ context/           → Global state for AOIs & theme
 ├─ utils/             → GeoJSON parser, export helpers
 ├─ services/          → Storage layer (localStorage for AOIs)
 └─ tests/             → Playwright tests
```

Reasons:
- Separation of UI and map logic improves maintainability
- Storage service makes persistence replaceable with DB later
- Context ensures synced state between map and sidebar
- Scalable component structure for future features

---

<h1>⚡ Performance Considerations</h1>

The solution is designed with future scaling (1000+ polygons) in mind.

### Current Optimizations
- Debounced map interactions
- Simplified rendering of large polygons
- Local spatial filtering before drawing
- Lazy loading AOIs from storage

### Future Optimizations (Planned)
- Vector tile rendering
- Web workers for GeoJSON parsing
- Clustering for high-density points
- R-tree spatial indexing

---

<h1>🧪 Testing Strategy</h1>

Testing was done using **Playwright**.

| Test | Purpose |
|------|---------|
| Loads map and WMS layer | Guarantees core map features work |
| Draw + save AOI | Ensures drawing logic and persistence |
| Export functionality | Verifies output formats |

If more time was available:
- Unit tests for GeoJSON utilities
- Component tests for Sidebar and Controls

Run tests:
```bash
npx playwright test
```

---

<h1>🔁 Tradeoffs & Decisions</h1>

| Decision | Tradeoff |
|----------|----------|
| LocalStorage for AOI persistence | No cloud sync yet |
| Client-side only | Faster delivery but no multi-user support |
| Limited clustering | Not required for small dataset scope |
| No backend API initially | Narrowed project focus to mapping & UI |

---

<h1>🏭 Production Readiness – Next Steps</h1>

| Feature | Purpose |
|--------|--------|
| Auth + roles | Secure user data |
| IndexedDB or backend DB | High-volume spatial data |
| Offline caching for tiles | Better performance |
| Error monitoring (Sentry) | Faster debugging |
| CI/CD + Docker | Deployment automation |

---

## ⏱ Time Spent

| Task | Hours |
|------|------|
| Project setup & tooling | ? |
| Map integration & WMS | ? |
| AOI drawing development | ? |
| Export/Import | ? |
| Styling + UI polish | ? |
| Testing | ? |
| Documentation | ? |

Fill based on your actual time.

---

## 🌐 API Documentation

```
GET /api/aoi
POST /api/aoi
DELETE /api/aoi/:id
```

Example response:
```json
{
  "id": "aoi_01",
  "name": "Field A",
  "coordinates": [...],
  "area": "2.51 km²"
}
```

---

## 🗂 Data / Schema Diagram

```
AOI
 ├─ id: string
 ├─ name: string
 ├─ geometry: GeoJSON
 ├─ area: number
 ├─ createdAt: Date
```

(Include er-diagram.png in /docs)

---

## 📌 Features Checklist

| Feature | Status |
|--------|--------|
| Pixel-perfect UI based on Figma | ✔ |
| WMS map layer | ✔ |
| Draw AOI | ✔ |
| Edit AOI | ✔ |
| Export (GeoJSON/WKT/KML) | ✔ |
| Import | ✔ |
| Local persistence | ✔ |
| Playwright tests | ✔ |

---

<h1>👤 Author</h1>
Utkarsh Srivastav

---

If you like this project, feel free to ⭐ the repository.

