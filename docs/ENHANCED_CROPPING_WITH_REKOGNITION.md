# Enhanced Cropping with AWS Rekognition Integration

## Overview

The cropping system has been enhanced to integrate AWS Rekognition face detection with smartcrop-gm, providing superior face-aware cropping that preserves important subjects while maintaining excellent visual composition.

## How It Works

### 1. **AWS Rekognition Face Detection**
- Detects faces in images using AWS Rekognition service
- Returns bounding boxes with confidence scores
- Coordinates are normalized (0-1) relative to image dimensions

### 2. **Smartcrop-gm with Face Boosts**
- Converts Rekognition bounding boxes to smartcrop-gm boost format
- Applies face boosts with high weight (0.8) to prioritize face areas
- smartcrop-gm considers both visual interest and face locations

### 3. **Fallback Mechanisms**
- If AWS Rekognition fails, falls back to standard smartcrop-gm
- If smartcrop-gm fails, falls back to orientation-based cropping
- Graceful degradation ensures cropping always works

## Technical Implementation

### AWS Rekognition Endpoint
**File**: `server/api/ai/detect-faces-rekognition.post.js`

```javascript
// Detects faces using AWS Rekognition
const result = await client.send(new DetectFacesCommand({
  Image: { Bytes: imageBuffer },
  Attributes: ["DEFAULT"]
}))
```

### Enhanced Cropping Function
**File**: `server/api/memory-books/generate-pdf/[id].post.js`

```javascript
// Convert Rekognition bounding boxes to smartcrop-gm boost format
faceBoosts = rekognitionData.faces.map(face => ({
  x: face.box.Left,
  y: face.box.Top,
  width: face.box.Width,
  height: face.box.Height,
  weight: 0.8 // High weight for faces
}))

// Apply boosts to smartcrop-gm
const result = await smartcropGm.crop(imagePath, {
  width: targetWidth,
  height: targetHeight,
  boost: faceBoosts
})
```

## Configuration

### Environment Variables
Add these to your `.env` file:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### AWS Permissions
Ensure your AWS credentials have permission for:
- `rekognition:DetectFaces`

## Benefits

### 1. **Face Preservation**
- Automatically detects and preserves faces in crops
- Prevents cutting off heads or important facial features
- Works especially well for small square crops

### 2. **Intelligent Composition**
- smartcrop-gm still considers visual interest and composition
- Face boosts guide the algorithm without overriding visual quality
- Maintains excellent aesthetic results

### 3. **Reliability**
- Multiple fallback mechanisms ensure cropping always works
- Graceful degradation if AWS services are unavailable
- Comprehensive error handling and logging

## Usage Examples

### Standard Cropping
```javascript
// Automatically uses AWS Rekognition if available
const croppedImage = await smartCropImage(imageBuffer, 227, 227, storageUrl)
```

### Without Storage URL
```javascript
// Falls back to standard smartcrop-gm
const croppedImage = await smartCropImage(imageBuffer, 227, 227)
```

## Performance Considerations

### AWS Rekognition Limits
- Maximum image size: 5MB
- Supported formats: JPEG, PNG
- Rate limits apply based on AWS account

### Caching
- Consider caching face detection results for repeated crops
- Face detection adds ~200-500ms per image
- smartcrop-gm processing time remains the same

## Error Handling

### Common Issues
1. **AWS Credentials**: Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
2. **Image Format**: Ensure images are JPEG or PNG
3. **Image Size**: Images must be under 5MB for Rekognition
4. **Network**: Ensure internet connectivity for AWS API calls

### Fallback Behavior
- If Rekognition fails → smartcrop-gm without boosts
- If smartcrop-gm fails → orientation-based cropping
- If all fail → simple resize with cover fit

## Testing

### Test the Integration
```bash
# Test face detection endpoint
curl -X POST http://localhost:3000/api/ai/detect-faces-rekognition \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/test-image.jpg"}'
```

### Monitor Logs
Look for these log messages:
- `🔍 AWS Rekognition: Detecting faces for smartcrop-gm boost...`
- `✅ AWS Rekognition: Found X faces`
- `🎯 Using smartcrop-gm with face boosts`

## Future Enhancements

### Potential Improvements
1. **Face Confidence Thresholds**: Only boost high-confidence face detections
2. **Multiple Subject Types**: Detect and boost other important subjects (animals, objects)
3. **Caching Layer**: Cache face detection results to improve performance
4. **Batch Processing**: Process multiple images simultaneously

### Advanced Features
1. **Age/Gender Detection**: Use additional Rekognition attributes
2. **Emotion Analysis**: Consider emotional expressions in cropping
3. **Custom Boost Weights**: Adjust weights based on face size or position
