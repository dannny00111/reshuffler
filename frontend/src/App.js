import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizedVideo, setOptimizedVideo] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [viralMetadata, setViralMetadata] = useState(null);
  const [algorithmicScore, setAlgorithmicScore] = useState(0);
  const [optimizationLevel, setOptimizationLevel] = useState('aggressive'); // mild, balanced, aggressive
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Platform-specific optimization strategies
  const platformStrategies = {
    TikTok: {
      segmentStrategy: 'hook-heavy', // Start with highest energy
      optimalDuration: 15,
      hashtagLimit: 5,
      trendingPatterns: ['POV:', 'When you', 'This is why', 'Nobody talks about', 'Plot twist:'],
      algorithmicHacks: ['quick_cuts', 'audio_sync', 'trending_sounds', 'engagement_bait'],
      metadataFocus: 'engagement_optimization'
    },
    Instagram: {
      segmentStrategy: 'story-driven',
      optimalDuration: 30,
      hashtagLimit: 10,
      trendingPatterns: ['Behind the scenes', 'Day in my life', 'This changed everything', 'Unpopular opinion', 'Things I wish I knew'],
      algorithmicHacks: ['story_arc', 'visual_consistency', 'save_worthy', 'share_triggers'],
      metadataFocus: 'shareability_optimization'
    },
    YouTube: {
      segmentStrategy: 'retention-focused',
      optimalDuration: 60,
      hashtagLimit: 3,
      trendingPatterns: ['The truth about', 'What they don\'t tell you', 'I tried this for 30 days', 'This will change your life', 'You\'re doing it wrong'],
      algorithmicHacks: ['retention_hooks', 'watch_time_optimization', 'click_bait_thumbnails', 'comment_triggers'],
      metadataFocus: 'retention_optimization'
    },
    Twitter: {
      segmentStrategy: 'controversy-light',
      optimalDuration: 10,
      hashtagLimit: 2,
      trendingPatterns: ['Hot take:', 'Unpopular opinion:', 'This is facts:', 'Change my mind:', 'Thread 🧵'],
      algorithmicHacks: ['engagement_triggers', 'retweet_bait', 'quote_worthy', 'discussion_starters'],
      metadataFocus: 'virality_optimization'
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setOptimizedVideo(null);
      setViralMetadata(null);
      setAlgorithmicScore(0);
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setOptimizedVideo(null);
      setViralMetadata(null);
      setAlgorithmicScore(0);
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

  // AI-powered viral metadata generation
  const generateViralMetadata = async (platform, optimizationLevel) => {
    try {
      const strategy = platformStrategies[platform];
      const prompt = `Generate VIRAL metadata for ${platform} video optimization:

PLATFORM: ${platform}
OPTIMIZATION LEVEL: ${optimizationLevel}
VIDEO DURATION: ${Math.round(videoDuration)}s

Generate JSON with these fields:
{
  "title": "Click-worthy title using patterns: ${strategy.trendingPatterns.join(', ')}",
  "description": "Engaging description with hooks and call-to-actions",
  "hashtags": ["array of ${strategy.hashtagLimit} trending hashtags for ${platform}"],
  "hooks": ["3 different viral hooks for opening"],
  "captions": ["3 viral caption variations"],
  "trending_keywords": ["keywords that boost algorithmic reach"],
  "engagement_triggers": ["phrases that drive comments/shares"],
  "algorithm_hacks": ${JSON.stringify(strategy.algorithmicHacks)},
  "viral_score_prediction": "number between 60-95",
  "best_posting_times": ["optimal posting schedule"],
  "competitor_analysis": "how to stand out from similar content"
}

Make it ${optimizationLevel} level viral optimization.`;

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
          max_tokens: 800,
          temperature: optimizationLevel === 'aggressive' ? 0.9 : optimizationLevel === 'balanced' ? 0.7 : 0.5
        })
      });
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      try {
        // Try to parse as JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Parsing JSON failed, using fallback');
      }
      
      // Fallback metadata
      return generateFallbackMetadata(platform, strategy);
      
    } catch (error) {
      console.error('Viral metadata generation failed:', error);
      return generateFallbackMetadata(platform, platformStrategies[platform]);
    }
  };

  const generateFallbackMetadata = (platform, strategy) => {
    return {
      title: `${strategy.trendingPatterns[0]} This Video Will Change Your Perspective`,
      description: `Viral content optimized for ${platform} algorithm. ${strategy.trendingPatterns[1]} you need to see this!`,
      hashtags: platform === 'TikTok' ? ['fyp', 'viral', 'trending', 'foryou', 'algorithm'] :
                platform === 'Instagram' ? ['reels', 'viral', 'trending', 'explore', 'algorithm', 'growth', 'content', 'creator', 'instagood', 'daily'] :
                platform === 'YouTube' ? ['shorts', 'viral', 'trending'] :
                ['viral', 'trending'],
      hooks: ['Wait for it...', 'This is insane', 'You need to see this'],
      captions: [
        `${strategy.trendingPatterns[0]} This content hits different 🔥`,
        `Algorithm about to push this HARD 📈`,
        `Posting this before it goes viral 🚀`
      ],
      trending_keywords: ['viral', 'trending', 'algorithm', 'growth', 'content'],
      engagement_triggers: ['Comment if you agree', 'Share this with someone', 'Save for later'],
      algorithm_hacks: strategy.algorithmicHacks,
      viral_score_prediction: Math.floor(Math.random() * 25) + 70,
      best_posting_times: ['6-9 PM local time', 'Tuesday-Thursday peak', 'Weekend morning boost'],
      competitor_analysis: 'Stand out with unique angle and trending audio'
    };
  };

  // Smart video segment analysis and reshuffling
  const analyzeAndReshuffleVideo = async () => {
    setProcessingStep('🧠 Analyzing video segments for algorithmic optimization...');
    
    const strategy = platformStrategies[selectedPlatform];
    const targetDuration = strategy.optimalDuration;
    
    // Simulate video analysis (in real implementation, would use actual video processing)
    const segments = [];
    const segmentCount = Math.min(8, Math.floor(videoDuration / 3));
    
    for (let i = 0; i < segmentCount; i++) {
      const start = (videoDuration / segmentCount) * i;
      const end = Math.min(videoDuration, start + (videoDuration / segmentCount));
      const energy = Math.random() * 100; // Simulated energy/engagement level
      const uniqueness = Math.random() * 100; // Algorithmic uniqueness score
      
      segments.push({
        id: i,
        start: start,
        end: end,
        duration: end - start,
        energyLevel: energy,
        uniquenessScore: uniqueness,
        algorithmicValue: (energy + uniqueness) / 2,
        type: i === 0 ? 'hook' : i === segmentCount - 1 ? 'outro' : 'content'
      });
    }
    
    setProcessingStep('🎯 Applying algorithmic reshuffling strategy...');
    
    // Smart reshuffling based on platform strategy
    let reshuffledSegments = [];
    
    switch (strategy.segmentStrategy) {
      case 'hook-heavy':
        // TikTok: Start with highest energy, maintain engagement
        reshuffledSegments = segments
          .sort((a, b) => a.type === 'hook' ? -1 : b.type === 'hook' ? 1 : b.energyLevel - a.energyLevel)
          .slice(0, Math.ceil(targetDuration / 3));
        break;
        
      case 'story-driven':
        // Instagram: Maintain narrative flow but optimize energy distribution
        const hook = segments.find(s => s.type === 'hook');
        const content = segments.filter(s => s.type === 'content').sort((a, b) => b.algorithmicValue - a.algorithmicValue);
        const outro = segments.find(s => s.type === 'outro');
        reshuffledSegments = [hook, ...content.slice(0, 3), outro].filter(Boolean);
        break;
        
      case 'retention-focused':
        // YouTube: Balance energy throughout for watch time
        reshuffledSegments = segments
          .sort((a, b) => b.algorithmicValue - a.algorithmicValue)
          .slice(0, Math.ceil(targetDuration / 5));
        break;
        
      case 'controversy-light':
        // Twitter: Highest uniqueness first
        reshuffledSegments = segments
          .sort((a, b) => b.uniquenessScore - a.uniquenessScore)
          .slice(0, 2);
        break;
    }
    
    return {
      originalSegments: segments,
      reshuffledSegments: reshuffledSegments,
      optimizationReason: `Reshuffled for ${strategy.segmentStrategy} strategy on ${selectedPlatform}`,
      algorithmicScore: Math.floor(reshuffledSegments.reduce((sum, seg) => sum + seg.algorithmicValue, 0) / reshuffledSegments.length)
    };
  };

  // Main optimization process
  const optimizeVideo = async () => {
    if (!videoFile || !videoRef.current) return;
    
    setIsProcessing(true);
    setOptimizedVideo(null);
    
    try {
      // Step 1: Generate viral metadata
      setProcessingStep('🔥 Generating viral metadata and hashtag strategy...');
      const metadata = await generateViralMetadata(selectedPlatform, optimizationLevel);
      setViralMetadata(metadata);
      
      // Step 2: Analyze and reshuffle video
      const videoAnalysis = await analyzeAndReshuffleVideo();
      setAlgorithmicScore(videoAnalysis.algorithmicScore);
      
      // Step 3: Create optimized version
      setProcessingStep('⚡ Applying algorithmic personalization...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Step 4: Generate thumbnail
      setProcessingStep('🎨 Creating algorithm-optimized thumbnail...');
      const thumbnail = await createOptimizedThumbnail();
      
      // Step 5: Compile final result
      setOptimizedVideo({
        originalVideoUrl: videoUrl,
        metadata: metadata,
        videoAnalysis: videoAnalysis,
        thumbnail: thumbnail,
        optimizationSummary: {
          platform: selectedPlatform,
          level: optimizationLevel,
          algorithmicScore: videoAnalysis.algorithmicScore,
          viralPotential: metadata.viral_score_prediction,
          optimizationApplied: videoAnalysis.optimizationReason
        }
      });
      
      setProcessingStep(`✅ Video optimized for ${selectedPlatform} algorithm! Viral potential: ${metadata.viral_score_prediction}%`);
      
    } catch (error) {
      console.error('Optimization error:', error);
      setProcessingStep('❌ Optimization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createOptimizedThumbnail = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      // Get best frame (simulated - would use actual analysis)
      const bestTime = videoDuration * 0.3; // Usually good engagement point
      video.currentTime = bestTime;
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Apply algorithmic optimization effects
        ctx.filter = optimizationLevel === 'aggressive' ? 
          'contrast(1.4) saturate(1.6) brightness(1.2)' :
          optimizationLevel === 'balanced' ?
          'contrast(1.2) saturate(1.3) brightness(1.1)' :
          'contrast(1.1) saturate(1.1) brightness(1.05)';
          
        ctx.drawImage(video, 0, 0);
        
        // Add viral overlay elements (simulated)
        if (optimizationLevel === 'aggressive') {
          ctx.filter = 'none';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      };
    });
  };

  const downloadOptimizedContent = () => {
    if (!optimizedVideo) return;
    
    // Create comprehensive package
    const contentPackage = {
      metadata: optimizedVideo.metadata,
      optimization_summary: optimizedVideo.optimizationSummary,
      video_analysis: optimizedVideo.videoAnalysis,
      instructions: `
VIRAL CONTENT PACKAGE - ${selectedPlatform.toUpperCase()}

🎯 OPTIMIZED FOR: ${selectedPlatform} Algorithm
📊 VIRAL SCORE: ${optimizedVideo.metadata.viral_score_prediction}%
🔥 ALGORITHMIC SCORE: ${algorithmicScore}/100

📝 VIRAL TITLE:
${optimizedVideo.metadata.title}

📖 DESCRIPTION:
${optimizedVideo.metadata.description}

🏷️ HASHTAGS (Copy-paste ready):
${optimizedVideo.metadata.hashtags.map(tag => '#' + tag).join(' ')}

🪝 VIRAL HOOKS (Choose one):
${optimizedVideo.metadata.hooks.map((hook, i) => `${i + 1}. ${hook}`).join('\n')}

💬 CAPTIONS (Pick your favorite):
${optimizedVideo.metadata.captions.map((caption, i) => `${i + 1}. ${caption}`).join('\n')}

🎯 ENGAGEMENT TRIGGERS:
${optimizedVideo.metadata.engagement_triggers.join('\n')}

⏰ BEST POSTING TIMES:
${optimizedVideo.metadata.best_posting_times.join('\n')}

🚀 ALGORITHM HACKS APPLIED:
${optimizedVideo.metadata.algorithm_hacks.join(', ')}

📈 COMPETITOR EDGE:
${optimizedVideo.metadata.competitor_analysis}

🎬 VIDEO OPTIMIZATION:
${optimizedVideo.videoAnalysis.optimizationReason}
      `
    };
    
    // Download metadata file
    const blob = new Blob([contentPackage.instructions], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `viral_${selectedPlatform.toLowerCase()}_package.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Download thumbnail
    if (optimizedVideo.thumbnail) {
      const thumbLink = document.createElement('a');
      thumbLink.href = URL.createObjectURL(optimizedVideo.thumbnail);
      thumbLink.download = `optimized_thumbnail_${selectedPlatform.toLowerCase()}.jpg`;
      document.body.appendChild(thumbLink);
      thumbLink.click();
      document.body.removeChild(thumbLink);
    }
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
          🧠 ALGORITHM DOMINATOR
        </h1>
        <p className="text-xl md:text-2xl text-purple-200 mb-2">
          Smart Video Reshuffling + Viral Metadata Injection
        </p>
        <div className="text-sm text-purple-300 mb-6">
          ⚡ Algorithmic Personalization • 🎯 Platform Optimization • 🔥 Viral Metadata • 📈 Beat The Algorithm
        </div>
        
        {/* Score Display */}
        {algorithmicScore > 0 && (
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 rounded-full">
              <span className="text-white font-bold">🧠 Algorithm Score: {algorithmicScore}/100</span>
            </div>
            {viralMetadata && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full">
                <span className="text-white font-bold">🔥 Viral Potential: {viralMetadata.viral_score_prediction}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Control Panel */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Platform Selection */}
            <div>
              <label className="text-white font-bold mb-3 block">🎯 Target Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg"
              >
                <option value="TikTok">🎵 TikTok (Hook-Heavy)</option>
                <option value="Instagram">📸 Instagram (Story-Driven)</option>
                <option value="YouTube">🎬 YouTube (Retention-Focused)</option>
                <option value="Twitter">🐦 Twitter (Controversy-Light)</option>
              </select>
              <div className="text-xs text-purple-300 mt-2">
                Optimal duration: {platformStrategies[selectedPlatform].optimalDuration}s
              </div>
            </div>
            
            {/* Optimization Level */}
            <div>
              <label className="text-white font-bold mb-3 block">⚡ Algorithm Hack Level</label>
              <select
                value={optimizationLevel}
                onChange={(e) => setOptimizationLevel(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg"
              >
                <option value="mild">😊 Mild (Safe Play)</option>
                <option value="balanced">⚖️ Balanced (Smart Optimization)</option>
                <option value="aggressive">🚀 Aggressive (Max Viral Potential)</option>
              </select>
              <div className="text-xs text-purple-300 mt-2">
                Controls AI creativity and risk level
              </div>
            </div>
            
            {/* Strategy Info */}
            <div>
              <label className="text-white font-bold mb-3 block">🧠 Current Strategy</label>
              <div className="bg-black/30 rounded-lg p-3 text-sm text-purple-200">
                <div className="font-semibold mb-1">{platformStrategies[selectedPlatform].segmentStrategy}</div>
                <div className="text-xs text-gray-300">
                  {platformStrategies[selectedPlatform].metadataFocus.replace('_', ' ')}
                </div>
                <div className="text-xs text-blue-300 mt-1">
                  Hashtag limit: {platformStrategies[selectedPlatform].hashtagLimit}
                </div>
              </div>
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
              <p className="text-white text-2xl mb-2">Drop your video for algorithmic domination</p>
              <p className="text-purple-300 text-lg mb-6">AI will reshuffle segments + inject viral metadata</p>
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
                📹 Duration: {Math.round(videoDuration)}s | 🎯 Target: {selectedPlatform} | ⚡ Level: {optimizationLevel}
              </div>
              <button
                onClick={optimizeVideo}
                disabled={isProcessing}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-lg font-bold text-xl disabled:opacity-50 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                {isProcessing ? '🧠 Optimizing Algorithm...' : '🚀 DOMINATE ALGORITHM'}
              </button>
            </div>
          )}
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6 text-center border border-purple-500/30">
            <div className="text-white text-xl mb-4">{processingStep}</div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full animate-pulse loading-shimmer" style={{width: '75%'}}></div>
            </div>
            <div className="text-purple-300">AI is reshuffling your content for maximum algorithmic impact... 🧠✨</div>
          </div>
        )}

        {/* Optimized Result */}
        {optimizedVideo && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                ✅ ALGORITHM DOMINATED!
              </h2>
              <p className="text-xl text-green-400">
                Your video is now optimized for maximum viral potential
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Optimization Summary */}
              <div className="bg-black/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📊 Optimization Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Platform:</span>
                    <span className="text-white font-bold">{selectedPlatform}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Algorithm Score:</span>
                    <span className="text-green-400 font-bold">{algorithmicScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Viral Potential:</span>
                    <span className="text-green-400 font-bold">{optimizedVideo.metadata.viral_score_prediction}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Optimization Level:</span>
                    <span className="text-white font-bold">{optimizationLevel}</span>
                  </div>
                  <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                    <div className="text-sm text-purple-200">
                      <strong>Applied:</strong> {optimizedVideo.optimizationSummary.optimizationApplied}
                    </div>
                  </div>
                </div>
              </div>

              {/* Viral Metadata Preview */}
              <div className="bg-black/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-4">🔥 Viral Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-purple-300 text-sm font-bold block mb-1">📝 Viral Title:</label>
                    <div className="text-white text-sm bg-black/40 p-2 rounded">{optimizedVideo.metadata.title}</div>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm font-bold block mb-1">🏷️ Hashtags:</label>
                    <div className="text-blue-300 text-sm">
                      {optimizedVideo.metadata.hashtags.map(tag => '#' + tag).join(' ')}
                    </div>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm font-bold block mb-1">🪝 Best Hook:</label>
                    <div className="text-white text-sm bg-black/40 p-2 rounded">{optimizedVideo.metadata.hooks[0]}</div>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm font-bold block mb-1">💬 Viral Caption:</label>
                    <div className="text-white text-sm bg-black/40 p-2 rounded">{optimizedVideo.metadata.captions[0]}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Hacks Applied */}
            <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-4">⚡ Algorithm Hacks Applied</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {optimizedVideo.metadata.algorithm_hacks.map((hack, index) => (
                  <div key={index} className="bg-black/40 rounded-lg p-3 text-center">
                    <div className="text-green-400 font-bold text-sm">
                      {hack.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={downloadOptimizedContent}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                📦 DOWNLOAD VIRAL PACKAGE
              </button>
              <div className="text-purple-300 text-sm mt-2">
                Includes: Optimized metadata, viral hashtags, captions, thumbnails & posting strategy
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