// Metadata Sanitization Manager
class MetadataSanitizer {
  constructor() {
    this.phoneModels = [
      'iPhone 15 Pro',
      'iPhone 14 Pro',
      'iPhone 13 Pro',
      'Samsung Galaxy S24',
      'Samsung Galaxy S23',
      'Google Pixel 8',
      'Google Pixel 7',
      'OnePlus 11'
    ];
    
    this.naturalApps = [
      'Camera',
      'Instagram', 
      'TikTok',
      'Snapchat'
    ];
  }

  // Generate natural-looking filename
  generateNaturalFilename(platform) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9999);
    
    const patterns = {
      'TikTok': () => `VID_${timestamp}_${random}.mp4`,
      'Instagram': () => `IMG_${random}.MP4`,
      'YouTube': () => `VID${random}.mp4`, 
      'Twitter': () => `video_${random}.mp4`
    };
    
    return patterns[platform] ? patterns[platform]() : `VID_${random}.mp4`;
  }

  // Generate realistic device metadata
  generateDeviceMetadata() {
    const model = this.phoneModels[Math.floor(Math.random() * this.phoneModels.length)];
    const app = this.naturalApps[Math.floor(Math.random() * this.naturalApps.length)];
    
    // Random but realistic creation time (within last few hours)
    const now = new Date();
    const creationTime = new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000);
    
    return {
      device: model,
      software: app,
      creationTime: creationTime.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Clean FFmpeg command to remove identifying signatures
  getSanitizedFFmpegCommand(inputFile, outputFile, filters, platform) {
    const metadata = this.generateDeviceMetadata();
    
    return [
      '-i', inputFile,
      '-vf', filters,
      '-c:v', 'libx264',
      '-preset', 'medium', // Use standard preset, not ultrafast
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-avoid_negative_ts', 'make_zero',
      
      // Strip all metadata
      '-map_metadata', '-1',
      '-map_chapters', '-1',
      
      // Add natural-looking metadata
      '-metadata', `title=`,
      '-metadata', `comment=`,
      '-metadata', `encoder=`,
      '-metadata', `creation_time=${metadata.creationTime}`,
      
      // Mobile-style encoding settings
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'baseline',
      '-level', '3.0',
      
      '-y',
      outputFile
    ];
  }

  // Generate natural aspect ratios that don't scream "processed"
  getNaturalAspectRatio(platform, originalWidth, originalHeight) {
    const ratios = {
      'TikTok': { width: 720, height: 1280 }, // Standard mobile
      'Instagram': { width: 1080, height: 1350 }, // Standard Instagram
      'YouTube': { width: 1080, height: 1920 }, // Standard YT Shorts
      'Twitter': { width: 1280, height: 720 } // Standard landscape
    };
    
    return ratios[platform] || { width: originalWidth, height: originalHeight };
  }

  // Create filter that looks natural, not algorithmic
  createNaturalFilter(platform, aspectRatio) {
    const { width, height } = aspectRatio;
    
    // Base scaling with slight imperfection to mimic phone recording
    const scaleFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease`;
    const padFilter = `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`;
    
    // Subtle natural effects that phones might add
    const naturalEffects = {
      'TikTok': 'eq=contrast=1.02:saturation=1.01', // Very subtle
      'Instagram': 'eq=contrast=1.01:saturation=1.02:gamma=0.99',
      'YouTube': 'eq=contrast=1.01:saturation=1.01',
      'Twitter': 'eq=contrast=1.01:saturation=1.01'
    };
    
    const effect = naturalEffects[platform] || '';
    
    return effect ? `${scaleFilter},${padFilter},${effect}` : `${scaleFilter},${padFilter}`;
  }

  // Add natural phone-like artifacts
  addPhoneArtifacts() {
    // Very subtle noise that phones add
    return 'noise=alls=1:allf=t+u';
  }

  // Randomize encoding parameters to avoid detection
  getRandomizedEncodingParams() {
    const crfValues = [21, 22, 23, 24]; // Natural range
    const presets = ['medium', 'slow']; // Standard presets
    
    return {
      crf: crfValues[Math.floor(Math.random() * crfValues.length)],
      preset: presets[Math.floor(Math.random() * presets.length)]
    };
  }
}

export default MetadataSanitizer;