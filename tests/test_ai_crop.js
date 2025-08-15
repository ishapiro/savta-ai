#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

/**
 * Test script for aiCropRecommendation function
 * 
 * Usage: node tests/test_ai_crop.js [imageUrl] [targetWidth] [targetHeight]
 * 
 * Example: node tests/test_ai_crop.js "https://example.com/image.jpg" 800 600
 */

import { aiCropRecommendation } from '../server/utils/openai-client.js';

async function testAiCropRecommendation() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node tests/test_ai_crop.js [imageUrl] [targetWidth] [targetHeight]');
    console.log('');
    console.log('Example:');
    console.log('  node tests/test_ai_crop.js "https://example.com/image.jpg" 800 600');
    console.log('');
    console.log('Or test with a sample image:');
    console.log('  node tests/test_ai_crop.js "https://picsum.photos/1200/800" 400 300');
    return;
  }

  const [imageUrl, targetWidth, targetHeight] = args;
  
  console.log('🧪 Testing AI Crop Recommendation Function');
  console.log('==========================================');
  console.log(`📸 Image URL: ${imageUrl}`);
  console.log(`📏 Target dimensions: ${targetWidth}x${targetHeight}`);
  console.log('');

  try {
    console.log('🤖 Calling AI crop recommendation...');
    const startTime = Date.now();
    
    const result = await aiCropRecommendation(imageUrl, parseInt(targetWidth), parseInt(targetHeight));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ AI crop recommendation received!');
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log('');
    
    // Display the results in a formatted way
    console.log('📊 RESULTS:');
    console.log('===========');
    
    if (result.image) {
      console.log(`📐 Original image: ${result.image.width_px}x${result.image.height_px} pixels`);
    }
    
    if (result.crop_area) {
      const { x, y, width, height } = result.crop_area;
      console.log(`✂️  Recommended crop area:`);
      console.log(`   Position: (${(x * 100).toFixed(1)}%, ${(y * 100).toFixed(1)}%)`);
      console.log(`   Size: ${(width * 100).toFixed(1)}% x ${(height * 100).toFixed(1)}%`);
      console.log(`   Coordinates: x=${x.toFixed(3)}, y=${y.toFixed(3)}, w=${width.toFixed(3)}, h=${height.toFixed(3)}`);
    }
    
    if (result.priority_subjects && result.priority_subjects.length > 0) {
      console.log('');
      console.log('🎯 Priority subjects found:');
      result.priority_subjects.forEach((subject, index) => {
        console.log(`   ${index + 1}. ${subject.type} (confidence: ${(subject.confidence * 100).toFixed(1)}%)`);
        if (subject.bbox) {
          const { x, y, width, height } = subject.bbox;
          console.log(`      Position: (${(x * 100).toFixed(1)}%, ${(y * 100).toFixed(1)}%)`);
          console.log(`      Size: ${(width * 100).toFixed(1)}% x ${(height * 100).toFixed(1)}%`);
        }
      });
    }
    
    if (result.reasoning) {
      console.log('');
      console.log('💭 AI Reasoning:');
      console.log(`   ${result.reasoning}`);
    }
    
    if (result.confidence !== undefined) {
      console.log('');
      console.log(`🎯 Overall confidence: ${(result.confidence * 100).toFixed(1)}%`);
    }
    
    console.log('');
    console.log('📋 Full JSON response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing AI crop recommendation:');
    console.error(error.message);
    
    if (error.message.includes('OpenAI API key')) {
      console.log('');
      console.log('💡 Make sure you have set the OPENAI_API_KEY environment variable:');
      console.log('   export OPENAI_API_KEY="your-api-key-here"');
    }
    
    process.exit(1);
  }
}

// Run the test
testAiCropRecommendation();
