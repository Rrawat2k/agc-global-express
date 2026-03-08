# AGC Globex – Full Website & Admin Portal
## Complete Freight & Logistics Web Solution

---

## 📁 Files Delivered

| File | Purpose |
|------|---------|
| `index.html` | Main public website |
| `admin.html` | Admin/Agent backend portal |
| `README.md` | This documentation |

---

## 🌐 Main Website (`index.html`)

### Sections
1. **Navigation** – Fixed sticky nav with mobile hamburger menu
2. **Hero** – Full-screen with live shipment tracker card widget
3. **Services** – 6 service cards (Air, Sea, Road, Courier, Customs, Warehousing)
4. **Rate Calculator** – Real-time freight rate engine (Origin × Destination × Service × Bags × Weight)
5. **About Us** – Company story with floating badge & features
6. **Why Choose Us** – 4 stat cards
7. **Testimonials** – 3 client reviews
8. **Blog / Insights** – Dynamic cards loaded from backend
9. **Partners Ticker** – Brand logos
10. **Contact / Query Form** – Full submission form
11. **Footer** – Links, social, legal

### SEO Features
- Full meta tags (title, description, keywords, robots)
- Open Graph tags for social sharing
- Schema.org JSON-LD structured data (FreightForwarder type)
- Semantic HTML5 structure
- Canonical URL tag
- Blog posts include SEO keywords & meta descriptions (set from admin)

### Google Ads Readiness
- Blog page for organic traffic (content marketing)
- Fast loading single-file structure
- Proper heading hierarchy (H1 → H2 → H3)
- Descriptive alt attributes on interactive elements

---

## 💰 Rate Calculation Logic

**Formula:**
```
Total = (Base Rate + Per KG Rate × Weight) × Destination Multiplier × Cargo Surcharge
       + Fuel Surcharge (22%)
       + Handling (₹200 + ₹50/bag)
       + Customs Docs (3%)
       + Insurance (1.5%)
```

**Inputs:** Origin · Destination · Service · Bags · Weight · Cargo Type

**Configurable from Admin Panel (Rate Settings page)**

| Service | Base (₹) | Per KG (₹) |
|---------|----------|------------|
| Air Express | 800 | 280 |
| Air Standard | 500 | 180 |
| Sea FCL | 45,000 | 15 |
| Sea LCL | 8,000 | 25 |
| Courier | 350 | 200 |
| Road | 3,000 | 45 |

---

## 🔐 Admin Portal (`admin.html`)

### Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Agent | `agent@agc` | `agent123` |

### Pages

#### 📊 Dashboard
- Stats: Total queries, pending, accepted, active agents
- Recent queries table

#### 📬 Query Management
- All queries from the website appear here automatically
- Filter by status (Pending / Accepted)
- Search by name or email
- **Accept** a query → removes it from other agents' pending queues
- **View** full query details
- **Assign** query to a specific agent (admin only)
- Once accepted, removed from pending view

#### 👥 User Management (Admin only)
- Create agents with custom **access rights**:
  - `View Queries` – can see pending queries
  - `Accept Queries` – can accept/process queries
  - `View All Agents` – can see agent list
  - `Manage Blogs` – can publish blog posts
- Edit / Delete users
- Track accepted query count per agent

#### 📝 Blog Manager (Admin only)
- Create blog posts with: Title, Category, Emoji, Excerpt (SEO), Full Content, Author, Image URL, SEO Keywords
- Edit / Delete posts
- Posts appear live on `index.html` blogs section

#### 💰 Rate Settings (Admin only)
- Adjust base rates per service
- Adjust per-kg rates
- Adjust destination multipliers (12 major routes)
- Adjust cargo surcharges (Hazmat, Perishable, Fragile)
- Changes take effect immediately on website calculator

---

## 🔄 How Query Flow Works

```
Website Visitor Submits Query
        ↓
Stored in localStorage (agc_queries)
        ↓
Admin/Agents see it as "Pending" in their queue
        ↓
Agent/Admin clicks "Accept"
        ↓
Status → "Accepted" | acceptedBy = Agent Name
        ↓
Query DISAPPEARS from other agents' pending view
        ↓
Only appears in admin's full view (accepted status)
```

---

## 🚀 Deployment Instructions

### Static Hosting (Recommended)
Deploy both files to any static hosting:
- **Netlify** – drag & drop both files
- **Vercel** – `vercel deploy`
- **GitHub Pages** – push to repo
- **AWS S3 + CloudFront**
- **Traditional cPanel** – upload via FTP

### For Production Backend
The localStorage data store is a client-side simulation. For production:
1. Replace `DB.get/set/push` calls with REST API calls
2. Set up Node.js/Express or Django backend
3. Use PostgreSQL/MongoDB for queries, users, blogs
4. Add JWT authentication
5. Set up email notifications (SendGrid/AWS SES)

### Google Ads Setup
1. Deploy site with blogs live
2. Apply for Google Ads account
3. Add Google Tag Manager snippet to `<head>`
4. Set up conversion tracking on query form submission
5. Create ad groups targeting: "air freight India", "cross border shipping", etc.

---

## 📱 Responsive Design
- Fully responsive for mobile, tablet, desktop
- Mobile hamburger navigation
- Responsive grid layouts
- Touch-friendly buttons

---

## 🎨 Design System
- Primary: `#0A1628` (navy)
- Accent: `#E8722A` (orange)
- Gold: `#F5A623`
- Sky: `#3A9BD5`
- Fonts: Bebas Neue (headings) + Outfit (body) + DM Serif Display (section titles)
