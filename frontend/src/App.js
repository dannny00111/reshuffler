import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import BackgroundProcessingManager from './BackgroundProcessingManager';
import MetadataSanitizer from './MetadataSanitizer';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [viralMetadata, setViralMetadata] = useState(null);
  const [algorithmicScore, setAlgorithmicScore] = useState(0);
  const [optimizationLevel, setOptimizationLevel] = useState('aggressive');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [backgroundProcessingEnabled, setBackgroundProcessingEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const backgroundManagerRef = useRef(null);
  const metadataSanitizerRef = useRef(new MetadataSanitizer());

  // Initialize Background Processing Manager
  useEffect(() => {
    backgroundManagerRef.current = new BackgroundProcessingManager();
    
    // Check if background processing is supported
    const isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    setBackgroundProcessingEnabled(isSupported);
    
    if (isSupported) {
      console.log('🚀 Background processing enabled');
    } else {
      console.log('⚠️ Background processing not supported in this browser');
    }
  }, []);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        console.log('FFmpeg progress:', progress);
        const progressPercent = Math.round(progress * 100);
        setProcessingProgress(progressPercent);
        
        // Update background processing progress
        if (backgroundManagerRef.current && isProcessing) {
          backgroundManagerRef.current.updateProgress(
            processingStep,
            progressPercent,
            selectedPlatform
          );
          
          // Update Dynamic Island status if supported
          backgroundManagerRef.current.updateDynamicIslandStatus(
            processingStep,
            progressPercent,
            selectedPlatform
          );
        }
      });

      try {
        console.log('Loading FFmpeg...');
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFFmpegLoaded(true);
        console.log('✅ FFmpeg loaded successfully');
      } catch (error) {
        console.error('❌ FFmpeg failed to load:', error);
        alert('FFmpeg failed to load. Please refresh the page and try again.');
      }
    };
    loadFFmpeg();
  }, [isProcessing, processingStep, selectedPlatform]);

  // Platform-specific optimization strategies
  const platformStrategies = {
    TikTok: {
      segmentStrategy: 'hook-heavy',
      optimalDuration: 15,
      cuts: 'fast_cuts',
      effects: 'high_energy',
      aspectRatio: '9:16'
    },
    Instagram: {
      segmentStrategy: 'story-driven',
      optimalDuration: 30,
      cuts: 'smooth_transitions',
      effects: 'aesthetic',
      aspectRatio: '4:5'
    },
    YouTube: {
      segmentStrategy: 'retention-focused',
      optimalDuration: 60,
      cuts: 'strategic_hooks',
      effects: 'professional',
      aspectRatio: '9:16'
    },
    Twitter: {
      segmentStrategy: 'controversy-light',
      optimalDuration: 10,
      cuts: 'quick_punch',
      effects: 'attention_grabbing',
      aspectRatio: '16:9'
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setProcessedVideo(null);
      setViralMetadata(null);
      setAlgorithmicScore(0);
      setProcessingProgress(0);
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setProcessedVideo(null);
      setViralMetadata(null);
      setAlgorithmicScore(0);
      setProcessingProgress(0);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const onVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Generate viral metadata
  const generateViralMetadata = async (platform, optimizationLevel) => {
    try {
      const strategy = platformStrategies[platform];
      const prompt = `Generate VIRAL metadata for ${platform} video optimization:

PLATFORM: ${platform}
OPTIMIZATION LEVEL: ${optimizationLevel}
VIDEO DURATION: ${Math.round(videoDuration)}s → ${strategy.optimalDuration}s

Generate JSON with these fields:
{
  "title": "Click-worthy title for ${platform}",
  "description": "Engaging description with hooks",
  "hashtags": ["array of trending hashtags for ${platform}"],
  "hooks": ["3 viral opening hooks"],
  "captions": ["3 viral caption variations"],
  "viral_score_prediction": "number 70-95",
  "algorithm_hacks": ["specific hacks for ${platform}"]
}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
          temperature: 0.8
        })
      });
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Using fallback metadata');
      }
      
      return {
        title: `Viral ${platform} Content That Will Blow Your Mind`,
        description: `Optimized for ${platform} algorithm with ${optimizationLevel} viral strategy`,
        hashtags: platform === 'TikTok' ? ['fyp', 'viral', 'trending', 'foryou', 'algorithm'] :
                  platform === 'Instagram' ? ['reels', 'viral', 'trending', 'explore', 'instagood'] :
                  platform === 'YouTube' ? ['shorts', 'viral', 'trending'] : ['viral', 'trending'],
        hooks: ['Wait for this...', 'This is insane', 'You need to see this'],
        captions: [`This ${platform} algorithm hack is crazy! 🔥`, `Going viral with this strategy 📈`, `Algorithm loves this content 🚀`],
        viral_score_prediction: Math.floor(Math.random() * 25) + 70,
        algorithm_hacks: ['engagement_optimization', 'retention_boost', 'viral_triggers']
      };
      
    } catch (error) {
      console.error('Metadata generation failed:', error);
      return { title: 'Viral Content', hashtags: ['viral'], viral_score_prediction: 75 };
    }
  };

  // SANITIZED VIDEO PROCESSING WITH METADATA CLEANING
  const processVideoWithFFmpeg = async () => {
    if (!ffmpegLoaded || !videoFile) {
      throw new Error('FFmpeg not loaded or no video file');
    }

    const ffmpeg = ffmpegRef.current;
    const strategy = platformStrategies[selectedPlatform];
    const sanitizer = metadataSanitizerRef.current;
    
    console.log('🎬 Starting SANITIZED video processing with strategy:', strategy);
    updateProcessingStep('🔒 Preparing sanitized video processing...');
    
    try {
      // Write input file with original name
      console.log('📁 Loading video file into FFmpeg...');
      await ffmpeg.writeFile('original_input.mp4', await fetchFile(videoFile));
      
      // STEP 1: Create a clean intermediate file with no metadata
      console.log('🧹 Sanitizing metadata...');
      await ffmpeg.exec([
        '-i', 'original_input.mp4',
        '-map_metadata', '-1', // Strip all metadata
        '-map_chapters', '-1',
        '-c', 'copy',
        '-y',
        'clean_input.mp4'
      ]);
      
      // Get video info from clean file
      console.log('📊 Getting video information...');
      await ffmpeg.exec(['-i', 'clean_input.mp4']);
      
      // Calculate segments for reshuffling
      const targetDuration = strategy.optimalDuration;
      const segmentCount = Math.max(2, Math.min(4, Math.floor(videoDuration / 2))); // Fewer segments to look more natural
      const segmentDuration = videoDuration / segmentCount;
      
      console.log(`📐 Video info: ${videoDuration}s total, ${segmentCount} segments of ${segmentDuration}s each`);
      updateProcessingStep(`✂️ Creating ${segmentCount} natural segments...`);
      
      // Create segment list based on platform strategy (simplified for naturalness)
      let segmentOrder = [];
      
      switch (strategy.segmentStrategy) {
        case 'hook-heavy': // TikTok - Start strong
          segmentOrder = [0, Math.floor(segmentCount * 0.6)];
          break;
        case 'story-driven': // Instagram - Keep flow
          segmentOrder = [0, Math.floor(segmentCount * 0.3)];
          break;
        case 'retention-focused': // YouTube - Hook early
          segmentOrder = [0, Math.floor(segmentCount * 0.4)];
          break;
        case 'controversy-light': // Twitter - Quick impact
          segmentOrder = [Math.floor(segmentCount * 0.2), 0];
          break;
        default:
          segmentOrder = [0, 1];
      }
      
      // Ensure valid segments (max 2-3 for naturalness)
      segmentOrder = segmentOrder.filter(idx => idx < segmentCount).slice(0, 3);
      
      console.log('📋 Natural segment order:', segmentOrder);
      updateProcessingStep(`🎬 Extracting ${segmentOrder.length} key moments...`);
      
      // Extract segments with randomized encoding to avoid detection
      const encodingParams = sanitizer.getRandomizedEncodingParams();
      const segmentFiles = [];
      
      for (let i = 0; i < segmentOrder.length; i++) {
        const segmentIndex = segmentOrder[i];
        const startTime = segmentIndex * segmentDuration;
        const duration = Math.min(segmentDuration * 0.95, targetDuration / segmentOrder.length);
        
        const segmentName = `seg_${i}.mp4`;
        console.log(`✂️ Extracting segment ${i}: from ${startTime}s for ${duration}s`);
        
        // Use sanitized encoding
        await ffmpeg.exec([
          '-i', 'clean_input.mp4',
          '-ss', startTime.toString(),
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-preset', encodingParams.preset,
          '-crf', encodingParams.crf.toString(),
          '-c:a', 'aac',
          '-b:a', '128k',
          '-map_metadata', '-1', // No metadata
          '-y',
          segmentName
        ]);
        
        segmentFiles.push(segmentName);
      }
      
      updateProcessingStep('🔄 Naturally combining segments...');
      
      // Create concat file
      const concatContent = segmentFiles.map(file => `file '${file}'`).join('\n');
      await ffmpeg.writeFile('concat_list.txt', concatContent);
      
      // Concatenate with clean metadata
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat_list.txt',
        '-c', 'copy',
        '-map_metadata', '-1',
        '-y',
        'reshuffled_raw.mp4'
      ]);
      
      updateProcessingStep(`📱 Applying natural ${selectedPlatform} look...`);
      
      // Apply natural-looking filters (very subtle)
      const naturalAspectRatio = sanitizer.getNaturalAspectRatio(selectedPlatform, 720, 1280);
      const naturalFilter = sanitizer.createNaturalFilter(selectedPlatform, naturalAspectRatio);
      
      // Generate natural filename
      const naturalFilename = sanitizer.generateNaturalFilename(selectedPlatform);
      console.log('📱 Using natural filename pattern:', naturalFilename);
      
      // Final processing with completely sanitized metadata
      const finalEncodingParams = sanitizer.getRandomizedEncodingParams();
      const deviceMeta = sanitizer.generateDeviceMetadata();
      
      await ffmpeg.exec([
        '-i', 'reshuffled_raw.mp4',
        '-vf', naturalFilter,
        '-c:v', 'libx264',
        '-preset', finalEncodingParams.preset,
        '-crf', finalEncodingParams.crf.toString(),
        '-c:a', 'aac',
        '-b:a', '128k',
        
        // Completely strip and replace metadata
        '-map_metadata', '-1',
        '-map_chapters', '-1',
        
        // Add minimal, natural-looking metadata
        '-metadata', `creation_time=${deviceMeta.creationTime}`,
        '-metadata', 'title=',
        '-metadata', 'comment=',
        '-metadata', 'encoder=',
        '-metadata', 'software=',
        
        // Mobile-optimized settings
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'baseline',
        '-level', '3.0',
        
        '-y',
        'final_sanitized.mp4'
      ]);
      
      updateProcessingStep('🧹 Final sanitization and export...');
      
      // Read the sanitized video
      console.log('📤 Reading sanitized video...');
      const data = await ffmpeg.readFile('final_sanitized.mp4');
      const processedVideoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const processedVideoUrl = URL.createObjectURL(processedVideoBlob);
      
      console.log('✅ Video processing completed with full sanitization!');
      
      return {
        videoUrl: processedVideoUrl,
        videoBlob: processedVideoBlob,
        segmentsReshuffled: segmentOrder.length,
        originalDuration: videoDuration,
        newDuration: segmentOrder.length * (videoDuration / segmentCount * 0.95),
        optimizationsApplied: [`natural_${strategy.effects}`, 'metadata_sanitized', `aspect_ratio_${strategy.aspectRatio}`],
        naturalFilename: naturalFilename,
        deviceMetadata: deviceMeta
      };
      
    } catch (error) {
      console.error('❌ Video processing failed:', error);
      throw new Error(`Video processing failed: ${error.message}`);
    }
  };

  // Enhanced processing step handler
  const updateProcessingStep = (step) => {
    setProcessingStep(step);
    console.log('📝 Processing step:', step);
    
    // Update background processing manager
    if (backgroundManagerRef.current && isProcessing) {
      backgroundManagerRef.current.updateProgress(
        step,
        processingProgress,
        selectedPlatform
      );
    }
  };

  // Main processing function with background support
  const optimizeVideo = async () => {
    if (!videoFile || !videoRef.current) {
      alert('Please select a video file first');
      return;
    }

    if (!ffmpegLoaded) {
      alert('FFmpeg is still loading. Please wait and try again.');
      return;
    }
    
    console.log('🚀 Starting video optimization process...');
    setIsProcessing(true);
    setProcessedVideo(null);
    setProcessingProgress(0);
    
    // Start background processing
    if (backgroundManagerRef.current) {
      backgroundManagerRef.current.startBackgroundProcessing(
        videoFile,
        selectedPlatform,
        optimizationLevel,
        {
          onDownload: downloadProcessedVideo,
          onRetry: optimizeVideo
        }
      );
    }
    
    try {
      // Step 1: Generate viral metadata
      updateProcessingStep('🔥 Generating viral metadata...');
      console.log('🔥 Generating viral metadata for platform:', selectedPlatform);
      const metadata = await generateViralMetadata(selectedPlatform, optimizationLevel);
      setViralMetadata(metadata);
      console.log('✅ Metadata generated:', metadata);
      
      // Step 2: Process video with FFmpeg
      updateProcessingStep('🎬 Starting video processing...');
      console.log('🎬 Starting FFmpeg video processing...');
      const processedVideoData = await processVideoWithFFmpeg();
      console.log('✅ Video processing completed:', processedVideoData);
      
      // Step 3: Calculate algorithmic score
      const algorithmScore = Math.floor(
        (metadata.viral_score_prediction + 
         (processedVideoData.segmentsReshuffled * 10) + 
         (optimizationLevel === 'aggressive' ? 15 : optimizationLevel === 'balanced' ? 10 : 5)) / 1.5
      );
      setAlgorithmicScore(Math.min(100, algorithmScore));
      
      const finalData = {
        ...processedVideoData,
        metadata: metadata,
        algorithmicScore: algorithmScore,
        platform: selectedPlatform,
        optimizationLevel: optimizationLevel
      };
      
      setProcessedVideo(finalData);
      
      updateProcessingStep(`✅ Video successfully reshuffled and optimized for ${selectedPlatform}!`);
      console.log('🎉 Video optimization completed successfully!');
      
      // Complete background processing
      if (backgroundManagerRef.current) {
        backgroundManagerRef.current.completeProcessing({
          platform: selectedPlatform,
          algorithmScore: algorithmScore,
          duration: processedVideoData.newDuration
        });
      }
      
    } catch (error) {
      console.error('❌ Processing error:', error);
      updateProcessingStep(`❌ Processing failed: ${error.message}`);
      
      // Handle background processing error
      if (backgroundManagerRef.current) {
        backgroundManagerRef.current.errorProcessing(error, selectedPlatform);
      }
      
      alert(`Processing failed: ${error.message}\n\nPlease check the console for more details.`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadProcessedVideo = () => {
    if (!processedVideo) return;
    
    // Use the natural filename generated during processing
    const naturalFilename = processedVideo.naturalFilename || `VID_${Date.now()}.mp4`;
    
    // Download the sanitized video
    const link = document.createElement('a');
    link.href = processedVideo.videoUrl;
    link.download = naturalFilename; // Natural filename, no platform indicators
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Download metadata package (for user reference only)
    const metadataText = `
VIRAL VIDEO PACKAGE (SANITIZED)

🎬 VIDEO PROCESSING COMPLETE:
✅ Original Duration: ${Math.round(processedVideo.originalDuration)}s
✅ New Duration: ${Math.round(processedVideo.newDuration)}s  
✅ Segments Reshuffled: ${processedVideo.segmentsReshuffled}
✅ Optimizations Applied: ${processedVideo.optimizationsApplied.join(', ')}
✅ Algorithmic Score: ${processedVideo.algorithmicScore}/100
✅ Metadata: FULLY SANITIZED

📊 VIRAL METADATA:
📝 Title: ${processedVideo.metadata.title}
🏷️ Hashtags: ${processedVideo.metadata.hashtags.map(tag => '#' + tag).join(' ')}
🪝 Hooks: ${processedVideo.metadata.hooks.join(' | ')}
💬 Captions: ${processedVideo.metadata.captions.join(' | ')}
🚀 Viral Score: ${processedVideo.metadata.viral_score_prediction}%

⚡ ALGORITHM HACKS:
${processedVideo.metadata.algorithm_hacks.join(', ')}

🔒 SANITIZATION FEATURES:
✅ All identifying metadata stripped
✅ Natural filename pattern
✅ Mobile-optimized encoding
✅ Randomized processing parameters
✅ Natural device metadata simulation

🎯 PLATFORM: ${selectedPlatform}
⚡ OPTIMIZATION LEVEL: ${optimizationLevel}
📱 DEVICE SIMULATION: ${processedVideo.deviceMetadata?.device || 'Generic Mobile'}
`;

    const metadataBlob = new Blob([metadataText], { type: 'text/plain' });
    const metadataLink = document.createElement('a');
    metadataLink.href = URL.createObjectURL(metadataBlob);
    metadataLink.download = `viral_notes_${Date.now()}.txt`;
    document.body.appendChild(metadataLink);
    metadataLink.click();
    document.body.removeChild(metadataLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full animate-spin-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/10 to-purple-500/10 rounded-full animate-spin-reverse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-6 text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 animate-pulse-slow">
          ✂️ VIRAL VIDEO RESHUFFLER
        </h1>
        <p className="text-xl md:text-2xl text-purple-200 mb-2">
          ACTUAL Video Segment Reshuffling + Viral Optimization
        </p>
        <div className="text-sm text-purple-300 mb-6">
          🎬 Real FFmpeg Processing • ✂️ Segment Reordering • 🔥 Platform Effects • ⚡ Algorithm Hacks
        </div>
        
        {/* FFmpeg Status */}
        <div className="flex gap-4 items-center justify-center">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${ffmpegLoaded ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
            🛠️ FFmpeg: {ffmpegLoaded ? 'Ready' : 'Loading...'}
          </div>
          
          {backgroundProcessingEnabled && (
            <div className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300">
              📱 Background Processing: Enabled
            </div>
          )}
        </div>
        
        {/* Score Display */}
        {algorithmicScore > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 rounded-full">
              <span className="text-white font-bold">🧠 Algorithm Score: {algorithmicScore}/100</span>
            </div>
            {viralMetadata && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full">
                <span className="text-white font-bold">🔥 Viral Score: {viralMetadata.viral_score_prediction}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Control Panel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-white font-bold mb-3 block">🎯 Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg"
              >
                <option value="TikTok">🎵 TikTok (15s, 9:16, Hook-Heavy)</option>
                <option value="Instagram">📸 Instagram (30s, 4:5, Story-Driven)</option>
                <option value="YouTube">🎬 YouTube (60s, 9:16, Retention)</option>
                <option value="Twitter">🐦 Twitter (10s, 16:9, Quick-Punch)</option>
              </select>
            </div>
            
            <div>
              <label className="text-white font-bold mb-3 block">⚡ Optimization</label>
              <select
                value={optimizationLevel}
                onChange={(e) => setOptimizationLevel(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg"
              >
                <option value="mild">😊 Mild</option>
                <option value="balanced">⚖️ Balanced</option>
                <option value="aggressive">🚀 Aggressive</option>
              </select>
            </div>
            
            <div>
              <label className="text-white font-bold mb-3 block">🎬 Features</label>
              <div className="bg-black/30 rounded-lg p-3 text-sm text-purple-200">
                <div>✂️ Segment Reshuffling</div>
                <div>🎨 Platform Effects</div>
                <div>📐 Aspect Ratio Fix</div>
                <div>🔒 Metadata Sanitization</div>
                {backgroundProcessingEnabled && <div>📱 Background Processing</div>}
              </div>
            </div>
          </div>
          
          {backgroundProcessingEnabled && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-300 text-sm">
                <span className="text-lg">📱</span>
                <span><strong>Background Processing Enabled:</strong> You can switch to other tabs/apps while your video processes. You'll get notifications about progress and completion!</span>
              </div>
            </div>
          )}
          
          {/* Sanitization Notice */}
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <span className="text-lg">🔒</span>
              <span><strong>Privacy Protected:</strong> All identifying metadata is stripped and replaced with natural phone-like data. Your videos will look like authentic mobile recordings to algorithms.</span>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center mb-6 bg-black/20 backdrop-blur-sm hover:border-purple-300 transition-all"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!videoUrl ? (
            <div>
              <div className="text-6xl mb-4 animate-bounce">🎬</div>
              <p className="text-white text-2xl mb-2">Drop video for REAL processing</p>
              <p className="text-purple-300 text-lg mb-6">FFmpeg will actually reshuffle your video segments</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label 
                htmlFor="video-upload"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all inline-block font-bold text-xl"
              >
                Select Video File
              </label>
            </div>
          ) : (
            <div>
              <video 
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={onVideoLoaded}
                controls
                className="max-w-full max-h-80 mx-auto rounded-lg mb-4 shadow-2xl"
              />
              <div className="text-purple-200 mb-6 text-lg">
                📹 Original: {Math.round(videoDuration)}s → Target: {platformStrategies[selectedPlatform].optimalDuration}s | Platform: {selectedPlatform}
              </div>
              <button
                onClick={optimizeVideo}
                disabled={isProcessing || !ffmpegLoaded}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-lg font-bold text-xl disabled:opacity-50 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                {isProcessing ? '✂️ Processing Video...' : '🚀 RESHUFFLE VIDEO'}
              </button>
            </div>
          )}
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6 text-center border border-purple-500/30">
            <div className="text-white text-xl mb-4">{processingStep}</div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full transition-all duration-500" 
                style={{width: `${processingProgress}%`}}
              ></div>
            </div>
            <div className="text-purple-300 mb-4">Progress: {processingProgress}% - FFmpeg is actually reshuffling your video! ✂️</div>
            
            {backgroundProcessingEnabled && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-blue-300 text-sm flex items-center justify-center gap-2">
                  <span className="animate-pulse">📱</span>
                  <span>You can switch to other tabs/apps - processing continues in background!</span>
                </div>
                <div className="text-blue-200 text-xs mt-1">
                  You'll get notifications about progress and completion
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processed Video Result */}
        {processedVideo && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                ✅ VIDEO RESHUFFLED!
              </h2>
              <p className="text-xl text-green-400">
                Segments reordered and optimized for {selectedPlatform}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Processed Video Preview */}
              <div className="bg-black/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">🎬 Processed Video</h3>
                <video 
                  src={processedVideo.videoUrl}
                  controls
                  className="w-full rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm text-purple-200">
                  <div>📹 Duration: {Math.round(processedVideo.originalDuration)}s → {Math.round(processedVideo.newDuration)}s</div>
                  <div>✂️ Segments Reshuffled: {processedVideo.segmentsReshuffled}</div>
                  <div>🎨 Effects Applied: {processedVideo.optimizationsApplied.join(', ')}</div>
                  <div>🎯 Platform: {processedVideo.platform}</div>
                  <div>🔒 Metadata: SANITIZED</div>
                  <div>📱 Filename: {processedVideo.naturalFilename}</div>
                </div>
              </div>

              {/* Optimization Summary */}
              <div className="bg-black/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📊 Processing Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Algorithm Score:</span>
                    <span className="text-green-400 font-bold">{processedVideo.algorithmicScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Viral Potential:</span>
                    <span className="text-green-400 font-bold">{processedVideo.metadata.viral_score_prediction}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Optimization Level:</span>
                    <span className="text-white font-bold">{processedVideo.optimizationLevel}</span>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-white font-bold mb-2">🏷️ Generated Hashtags:</h4>
                    <div className="text-blue-300 text-sm">
                      {processedVideo.metadata.hashtags.map(tag => '#' + tag).join(' ')}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-white font-bold mb-2">🪝 Viral Hook:</h4>
                    <div className="text-white text-sm bg-black/40 p-2 rounded">
                      {processedVideo.metadata.hooks[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={downloadProcessedVideo}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                📥 DOWNLOAD RESHUFFLED VIDEO
              </button>
              <div className="text-purple-300 text-sm mt-2">
                Includes: Processed video file + viral metadata package
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

export default App;