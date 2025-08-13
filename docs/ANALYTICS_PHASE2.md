# Analytics Phase 2 - Enhanced User Analytics & Geolocation

## Overview

Phase 2 of the analytics system introduces advanced user engagement tracking, geolocation capabilities, and comprehensive marketing analytics. This phase builds upon the foundation established in Phase 1 to provide deeper insights into user behavior and geographic distribution.

## Key Features

### 1. Geolocation Tracking
- **MapBox Integration**: Uses MapBox API to determine user location from IP addresses
- **Privacy-First**: IP addresses are hashed for privacy compliance
- **Geographic Insights**: Track user distribution by country, region, and city
- **Private IP Filtering**: Automatically filters out private/local IP addresses

### 2. Enhanced Engagement Metrics
- **Scroll Depth Tracking**: Monitor how far users scroll on each page
- **Interaction Counting**: Track clicks, keypresses, and touch events
- **Time on Page**: Precise measurement of user engagement duration
- **Engagement Scoring**: Calculated engagement scores for each page

### 3. Marketing Analytics
- **UTM Parameter Tracking**: Capture and analyze marketing campaign data
- **Referrer Analysis**: Track traffic sources and referrer domains
- **Campaign Attribution**: Link user behavior to specific marketing campaigns

### 4. Technical Analytics
- **Device Information**: Screen resolution, viewport size, connection type
- **Browser & Language**: User's browser, language, and timezone
- **Performance Metrics**: Connection speed and device capabilities

## Implementation Details

### Database Schema Extensions

The `activity_log` table has been extended with new columns:

```sql
-- Geolocation columns
country text,
region text, 
city text,

-- Enhanced details in JSONB format
details jsonb DEFAULT '{}'::jsonb
```

### Enhanced Details Structure

The `details` JSONB field now includes:

```json
{
  "time_on_page": 120,
  "scroll_depth": 75,
  "interaction_count": 8,
  "utm_source": "google",
  "utm_medium": "cpc", 
  "utm_campaign": "brand",
  "screen_resolution": "1920x1080",
  "viewport_size": "1920x937",
  "connection_type": "4g",
  "language": "en-US",
  "timezone": "America/Los_Angeles",
  "referrer_domain": "google.com"
}
```

### API Endpoints

#### Enhanced Analytics Tracking
- **Endpoint**: `POST /api/analytics/track`
- **Enhancements**: 
  - Geolocation lookup via MapBox API
  - Enhanced engagement metrics
  - UTM parameter extraction
  - Technical data collection

#### Analytics Dashboard
- **Endpoint**: `GET /api/admin/analytics-dashboard`
- **Features**:
  - Aggregated metrics by time range
  - Geographic distribution analysis
  - Engagement scoring
  - Marketing attribution
  - Technical analytics

### Client-Side Enhancements

#### Enhanced Analytics Composable
The `useAnalytics` composable now includes:

- **Scroll Tracking**: Throttled scroll depth monitoring
- **Interaction Tracking**: Click, keypress, and touch event counting
- **Enhanced Device Info**: Screen resolution, connection type, language
- **UTM Parameter Extraction**: Automatic UTM parameter detection
- **Time Tracking**: Precise time-on-page measurement

#### Event Listeners
```javascript
// Scroll tracking (throttled)
window.addEventListener('scroll', trackScroll, { passive: true })

// Interaction tracking (throttled)
document.addEventListener('click', trackInteraction, { passive: true })
document.addEventListener('keydown', trackInteraction, { passive: true })
document.addEventListener('touchstart', trackInteraction, { passive: true })
```

## Analytics Dashboard

### Overview Metrics
- **Unique Users**: Total unique visitors in the selected time range
- **Page Views**: Total page views across all pages
- **Average Session Duration**: Mean session length in minutes/seconds
- **Engagement Score**: Average scroll depth percentage

### Geographic Distribution
- **Countries**: Top countries by visit count
- **Regions**: Geographic distribution within countries
- **Cities**: Most active cities

### Page Engagement Analysis
- **Engagement Scores**: Calculated scores (0-100) for each page
- **Time on Page**: Average time spent per page
- **Scroll Depth**: Average scroll percentage
- **Exit Rates**: Percentage of users leaving from each page

### Technical Analytics
- **Device Types**: Desktop, mobile, tablet distribution
- **Browsers**: Browser usage statistics
- **Screen Resolutions**: Most common screen sizes
- **Connection Types**: Network connection distribution

### Marketing Analytics
- **Referrers**: Top traffic sources
- **UTM Sources**: Marketing campaign attribution
- **UTM Mediums**: Traffic medium analysis
- **UTM Campaigns**: Campaign performance tracking

## Configuration

### Environment Variables

```bash
# MapBox API Token for geolocation
MAPBOX_TOKEN=your_mapbox_token_here

# Existing analytics configuration
SENDGRID_WEBHOOK_SECRET=your_webhook_secret
```

### MapBox API Setup

1. **Create MapBox Account**: Sign up at [mapbox.com](https://mapbox.com)
2. **Generate Access Token**: Create a public access token
3. **Configure Environment**: Add token to your environment variables
4. **API Limits**: MapBox provides 100,000 free requests per month

## Privacy & Compliance

### Data Protection
- **IP Hashing**: All IP addresses are hashed before storage
- **Private IP Filtering**: Local/private IPs are automatically filtered
- **GDPR Compliance**: User consent and data minimization practices
- **Data Retention**: Configurable data retention policies

### Geolocation Privacy
- **Country-Level**: Primary focus on country-level data
- **Optional Precision**: Region and city data are optional
- **User Control**: Users can opt out of geolocation tracking

## Performance Considerations

### Optimization Strategies
- **Throttled Events**: Scroll and interaction events are throttled
- **Batch Processing**: Events are batched before sending to server
- **Efficient Queries**: Database queries optimized with proper indexing
- **Caching**: Geographic data can be cached to reduce API calls

### Database Indexes
```sql
-- Geographic indexes
CREATE INDEX idx_activity_log_geo_time ON activity_log(country, region, timestamp DESC);

-- Engagement metrics indexes
CREATE INDEX idx_activity_log_engagement ON activity_log(action, timestamp DESC) WHERE action = 'page_visit';

-- UTM parameter indexes
CREATE INDEX idx_activity_log_utm ON activity_log USING GIN ((details->'utm_source'));
```

## Testing

### Test Scripts
- **`test_analytics_phase2.sql`**: Comprehensive Phase 2 testing
- **Geolocation Testing**: Verify MapBox API integration
- **Engagement Metrics**: Test scroll and interaction tracking
- **UTM Parameters**: Validate marketing attribution
- **Performance Testing**: Query execution time analysis

### Manual Testing
1. **Visit Test Page**: Navigate to `/test-analytics`
2. **Check Console Logs**: Verify analytics events are firing
3. **Test Geolocation**: Verify location data is being captured
4. **Dashboard Access**: Test the analytics dashboard at `/app/analytics-dashboard`

## Monitoring & Maintenance

### Key Metrics to Monitor
- **API Response Times**: MapBox API performance
- **Data Quality**: Geolocation accuracy and completeness
- **Storage Growth**: Database size and growth rate
- **Error Rates**: Failed analytics events or API calls

### Maintenance Tasks
- **Regular Cleanup**: Archive old analytics data
- **Index Maintenance**: Monitor and optimize database indexes
- **API Limits**: Monitor MapBox API usage
- **Data Validation**: Regular checks for data integrity

## Future Enhancements

### Phase 3 Considerations
- **Real-time Analytics**: Live dashboard updates
- **Advanced Segmentation**: User behavior segmentation
- **Predictive Analytics**: User behavior prediction
- **A/B Testing Integration**: Experiment tracking
- **Custom Events**: User-defined event tracking
- **Export Capabilities**: Data export and reporting

### Performance Improvements
- **Materialized Views**: Pre-computed analytics summaries
- **Partitioning**: Time-based table partitioning
- **Caching Layer**: Redis-based analytics caching
- **Background Jobs**: Asynchronous data processing

## Troubleshooting

### Common Issues

#### Geolocation Not Working
- **Check MapBox Token**: Verify token is valid and has proper permissions
- **API Limits**: Check if MapBox API limits have been exceeded
- **Private IPs**: Ensure you're testing with public IP addresses
- **Network Issues**: Verify network connectivity to MapBox API

#### Engagement Metrics Missing
- **JavaScript Errors**: Check browser console for errors
- **Event Listeners**: Verify event listeners are properly attached
- **Throttling**: Check if events are being throttled too aggressively
- **Data Processing**: Verify server-side processing is working

#### Dashboard Loading Issues
- **Authentication**: Ensure user has admin privileges
- **API Endpoints**: Verify analytics dashboard API is accessible
- **Data Volume**: Check if large datasets are causing timeouts
- **Database Performance**: Monitor query execution times

### Debug Commands
```bash
# Test geolocation API
curl "https://api.mapbox.com/geocoding/v5/mapbox.places/8.8.8.8.json?access_token=YOUR_TOKEN"

# Check analytics data
cat tests/test_analytics_phase2.sql | susql

# Monitor real-time analytics
tail -f logs/analytics.log
```

## Support & Resources

### Documentation
- [MapBox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

### Community
- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Join our community for support
- **Documentation**: Keep this documentation updated

---

**Last Updated**: December 2024  
**Version**: Phase 2.0  
**Maintainer**: Analytics Team
