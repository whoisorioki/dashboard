# Google Maps API Setup Guide for Sales Analytics Dashboard

## 🗺️ Map Integration Options

Your dashboard now has **3 map views**:

### 1. **Enhanced View (No API Key Needed) ✅ READY**
- Uses your existing Google Maps coordinates
- Shows branch details, profit data, and county aggregation
- Includes branch location list with exact coordinates
- **Currently Active** - No setup required!

### 2. **Basic Map (No API Key Needed) ✅ READY**
- Original choropleth view with improved color scaling
- County-level data visualization
- **Currently Active** - No setup required!

### 3. **Google Maps (API Key Required) 🔑**
- Interactive Google Maps with satellite imagery
- Real-time street view and traffic
- Advanced map features

---

## 🔑 Google Maps API Setup (Optional)

If you want full Google Maps functionality:

### **Step 1: Get API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview)
2. Create a new project or select existing one
3. **Enable APIs:**
   - Maps JavaScript API
   - Places API (optional for enhanced search)
4. **Create Credentials → API Key**

### **Step 2: Configure API Key**
```javascript
// In frontend/src/components/GoogleMapsBranchView.tsx
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### **Step 3: Security (Important!)**
- Restrict the API key to your domain
- Set up HTTP referrer restrictions
- Never commit API keys to version control

### **Step 4: Environment Variables (Recommended)**
```bash
# In frontend/.env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Then update the component:
```javascript
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## 💰 Pricing Information

**Google Maps API Costs:**
- **Free Tier:** 28,000 map loads per month
- **After Free Tier:** $7 per 1,000 additional loads
- **Typical Usage:** Small business dashboard = ~1,000 loads/month
- **Your Cost:** Likely $0 (within free tier)

---

## 🎯 Current Capabilities (Without API Key)

Your enhanced map already includes:

✅ **22 Branch Locations** with exact Google coordinates  
✅ **County-level aggregation** and profit visualization  
✅ **Interactive tooltips** with detailed branch information  
✅ **Professional styling** matching your dashboard theme  
✅ **Performance optimized** with percentile-based color scaling  

### **Branch Coordinates Available:**
- Nairobi (8 branches): HQ, Toyota, Doosan, etc.
- Mombasa: Mbaraki Road location
- Kisumu: Obote Road location  
- Nakuru: Eldoret Highway locations
- And 14 more regional branches

---

## 🚀 Recommendations

1. **Start with Enhanced View** (currently active) - no API needed
2. **Test with users** to see if Google Maps adds value
3. **Add API key later** if satellite/street view is requested
4. **Monitor usage** if you do implement Google Maps

The enhanced view provides 90% of the mapping functionality without any API costs or setup complexity!

---

## 🔧 Technical Details

**Current Implementation:**
- Enhanced view uses @nivo/geo for choropleth
- All branch coordinates are pre-mapped from Google Maps
- Tooltip shows exact lat/lng coordinates
- Color scaling optimized for data visibility

**Google Maps Would Add:**
- Satellite imagery and street view
- Real-time traffic data
- Enhanced zoom and pan controls
- Places API integration for address search
