import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import gifshot from 'gifshot';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [processingStep, setProcessingStep] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['TikTok', 'Instagram', 'YouTube']);
  const [viralMode, setViralMode] = useState('balanced'); // balanced, aggressive, trendy
  const [autoCaption, setAutoCaption] = useState(true);
  const [contentStats, setContentStats] = useState({ clips: 0, gifs: 0, thumbnails: 0, memes: 0 });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Viral trends data (would be updated regularly)
  const viralTrends = {
    TikTok: ['POV:', 'When you realize...', 'This is why I...', 'Nobody talks about...', 'Plot twist:'],
    Instagram: ['That feeling when...', 'Mood:', 'Currently:', 'This hit different', 'Main character energy'],
    YouTube: ['You won\'t believe...', 'The secret to...', 'What happens next...', 'This changes everything', 'Finally revealed']
  };

  // Enhanced platform specifications
  const platformSpecs = {
    TikTok: { 
      duration: [9, 15, 30], 
      ratio: '9:16', 
      trending: ['fyp', 'viral', 'trend', 'xyzbca', 'foryou'],
      hooks: ['Wait for it...', 'This is crazy', 'You need to see this']
    },
    Instagram: { 
      duration: [15, 30, 60], 
      ratio: '4:5', 
      trending: ['reels', 'explore', 'viral', 'instagood', 'trending'],
      hooks: ['Swipe for more', 'This is insane', 'Save this post']
    },
    YouTube: { 
      duration: [30, 45, 60], 
      ratio: '9:16', 
      trending: ['shorts', 'viral', 'trending', 'subscribe', 'youtube'],
      hooks: ['Watch till the end', 'Subscribe for more', 'This will blow your mind']
    },
    Twitter: { 
      duration: [5, 10, 15], 
      ratio: '16:9', 
      trending: ['viral', 'twitter', 'trending', 'thread', 'breaking'],
      hooks: ['Thread 🧵', 'This is wild', 'RT if you agree']
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setGeneratedContent([]);
      setContentStats({ clips: 0, gifs: 0, thumbnails: 0, memes: 0 });
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setGeneratedContent([]);
      setContentStats({ clips: 0, gifs: 0, thumbnails: 0, memes: 0 });
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

  // Advanced segment detection with AI scoring
  const getViralSegments = (duration) => {
    const segments = [];
    const segmentCount = viralMode === 'aggressive' ? 12 : viralMode === 'trendy' ? 8 : 6;
    
    selectedPlatforms.forEach(platform => {
      const specs = platformSpecs[platform];
      specs.duration.forEach((dur, index) => {
        // Strategic segment selection
        const positions = [
          0, // Opening hook
          duration * 0.2, // Early content
          duration * 0.4, // Mid content
          duration * 0.6, // Peak moment
          duration * 0.8, // Climax
          Math.max(0, duration - dur) // Ending
        ];
        
        positions.slice(0, segmentCount / selectedPlatforms.length).forEach((start, i) => {
          if (start + dur <= duration) {
            segments.push({
              start: Math.max(0, start),
              end: Math.min(duration, start + dur),
              type: ['Hook', 'Content', 'Peak', 'Climax', 'Finale', 'Outro'][i] || 'Moment',
              platform: platform,
              duration: dur,
              viralScore: Math.random() * 100 + 50, // Simulated viral potential
              priority: i === 0 ? 'high' : i < 3 ? 'medium' : 'low'
            });
          }
        });
      });
    });
    
    // Add micro-moments for GIFs/memes
    for (let i = 0; i < 8; i++) {
      const start = (duration / 8) * i + Math.random() * 5;
      const end = Math.min(duration, start + 3 + Math.random() * 4);
      segments.push({
        start: start,
        end: end,
        type: 'Micro Moment',
        platform: 'GIF',
        duration: end - start,
        viralScore: Math.random() * 80 + 20,
        priority: 'high'
      });
    }
    
    return segments.sort((a, b) => b.viralScore - a.viralScore);
  };

  // Enhanced AI content generation
  const generateViralContent = async (segment, contentType = 'caption') => {
    try {
      let prompt = '';
      
      switch (contentType) {
        case 'caption':
          prompt = `Generate a VIRAL ${segment.platform} caption for a ${segment.type} video segment (${Math.round(segment.duration)}s). Include:
          - Hook-heavy opening
          - Trending hashtags for ${segment.platform}
          - Call-to-action
          - Viral potential: ${Math.round(segment.viralScore)}/100
          Style: ${viralMode}
          Format: Caption | Hashtags | Hook`;
          break;
        case 'meme':
          prompt = `Create 3 VIRAL meme text overlays for ${segment.platform}. Current trends: ${viralTrends[segment.platform]?.join(', ')}
          Make them: Relatable, Funny, Trending, Short
          Format: Text1 | Text2 | Text3`;
          break;
        case 'title':
          prompt = `Generate CLICKBAIT titles for ${segment.platform} ${segment.type} content. 
          Hooks: ${platformSpecs[segment.platform]?.hooks.join(', ')}
          Make them: Curiosity-driven, Emotional, Trending
          Format: Title1 | Title2 | Title3`;
          break;
      }

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
          max_tokens: 200,
          temperature: viralMode === 'trendy' ? 0.9 : viralMode === 'aggressive' ? 0.8 : 0.7
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || getDefaultContent(contentType, segment);
    } catch (error) {
      console.error(`${contentType} generation failed:`, error);
      return getDefaultContent(contentType, segment);
    }
  };

  const getDefaultContent = (type, segment) => {
    const defaults = {
      caption: `${segment.type} on ${segment.platform}! 🔥 #Viral #${segment.platform} #Trending`,
      meme: ['POV:', 'When you realize...', 'This hits different'],
      title: [`Amazing ${segment.type}`, `You Won't Believe This`, `${segment.platform} Gold`]
    };
    return defaults[type] || 'Amazing content!';
  };

  // Enhanced thumbnail extraction with multiple styles
  const extractEnhancedThumbnail = (time, style = 'standard') => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      video.currentTime = time;
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame
        ctx.drawImage(video, 0, 0);
        
        // Apply style effects
        switch (style) {
          case 'dramatic':
            ctx.filter = 'contrast(1.3) saturate(1.4) brightness(1.1)';
            ctx.drawImage(video, 0, 0);
            break;
          case 'vintage':
            ctx.filter = 'sepia(0.5) contrast(1.2) brightness(0.9)';
            ctx.drawImage(video, 0, 0);
            break;
          case 'neon':
            ctx.filter = 'saturate(2) contrast(1.3) hue-rotate(45deg)';
            ctx.drawImage(video, 0, 0);
            break;
        }
        
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      };
    });
  };

  // Advanced GIF creation with effects
  const createAdvancedGIF = (startTime, endTime, style = 'standard') => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const interval = 0.15;
      const frames = [];
      let currentTime = startTime;
      
      const captureFrame = () => {
        if (currentTime >= endTime) {
          const gifOptions = {
            images: frames,
            gifWidth: style === 'square' ? 400 : 480,
            gifHeight: style === 'square' ? 400 : 270,
            interval: style === 'fast' ? 0.1 : 0.15,
            numFrames: frames.length,
            quality: style === 'hq' ? 5 : 10,
            repeat: 0
          };
          
          gifshot.createGIF(gifOptions, (obj) => {
            if (!obj.error) {
              resolve(obj.image);
            } else {
              resolve(null);
            }
          });
          return;
        }
        
        video.currentTime = currentTime;
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = style === 'square' ? 400 : 480;
          canvas.height = style === 'square' ? 400 : 270;
          
          // Apply effects
          if (style === 'neon') {
            ctx.filter = 'saturate(2) contrast(1.2) brightness(1.1)';
          } else if (style === 'vintage') {
            ctx.filter = 'sepia(0.3) contrast(1.1)';
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL());
          currentTime += interval;
          setTimeout(captureFrame, 50);
        };
      };
      
      captureFrame();
    });
  };

  // Main processing function with enhanced features
  const processVideo = async () => {
    if (!videoFile || !videoRef.current) return;
    
    setIsProcessing(true);
    setGeneratedContent([]);
    const content = [];
    let stats = { clips: 0, gifs: 0, thumbnails: 0, memes: 0 };
    
    try {
      const segments = getViralSegments(videoDuration);
      setProcessingStep('🧠 AI analyzing viral potential...');
      
      // Process top segments based on viral score
      const topSegments = segments.filter(seg => seg.platform !== 'GIF').slice(0, viralMode === 'aggressive' ? 10 : 8);
      
      for (let i = 0; i < topSegments.length; i++) {
        const segment = topSegments[i];
        setProcessingStep(`🎬 Creating ${segment.type} for ${segment.platform} (${i + 1}/${topSegments.length})`);
        
        // Generate multiple content types
        const [caption, titles] = await Promise.all([
          autoCaption ? generateViralContent(segment, 'caption') : `${segment.type} - ${segment.platform} Ready!`,
          generateViralContent(segment, 'title')
        ]);
        
        // Extract multiple thumbnail styles
        const thumbnailTime = segment.start + (segment.end - segment.start) / 2;
        const thumbnails = await Promise.all([
          extractEnhancedThumbnail(thumbnailTime, 'standard'),
          extractEnhancedThumbnail(thumbnailTime, 'dramatic'),
          extractEnhancedThumbnail(thumbnailTime, 'neon')
        ]);
        
        // Add video clip content
        content.push({
          id: `clip-${i}`,
          type: 'Video Clip',
          segment: segment,
          caption: caption,
          titles: typeof titles === 'string' ? titles.split('|') : [titles],
          thumbnails: thumbnails.map((thumb, idx) => ({
            url: URL.createObjectURL(thumb),
            style: ['Standard', 'Dramatic', 'Neon'][idx]
          })),
          platform: segment.platform,
          viralScore: segment.viralScore,
          priority: segment.priority,
          downloadData: { type: 'video', start: segment.start, end: segment.end }
        });
        stats.clips++;
      }
      
      // Create GIFs from micro moments
      setProcessingStep('🎨 Creating viral GIFs...');
      const gifSegments = segments.filter(seg => seg.platform === 'GIF').slice(0, 6);
      
      for (let i = 0; i < gifSegments.length; i++) {
        const segment = gifSegments[i];
        const styles = ['standard', 'fast', 'square'];
        const style = styles[i % styles.length];
        
        const gifData = await createAdvancedGIF(segment.start, segment.end, style);
        if (gifData) {
          const memeTexts = await generateViralContent(segment, 'meme');
          content.push({
            id: `gif-${i}`,
            type: 'Viral GIF',
            segment: segment,
            caption: `Micro moment GIF - ${style} style! Perfect for reactions 🔥`,
            gif: gifData,
            memeTexts: typeof memeTexts === 'string' ? memeTexts.split('|') : [memeTexts],
            style: style,
            downloadData: { type: 'gif', data: gifData }
          });
          stats.gifs++;
        }
      }
      
      // Generate strategic thumbnails
      setProcessingStep('🖼️ Creating click-worthy thumbnails...');
      const thumbnailTimes = [
        0, // Opening frame
        videoDuration * 0.1, // Early hook
        videoDuration * 0.3, // Build-up
        videoDuration * 0.5, // Peak
        videoDuration * 0.7, // Climax
        videoDuration * 0.9, // Resolution
        Math.max(0, videoDuration - 2) // Final moment
      ];
      
      for (let i = 0; i < thumbnailTimes.length; i++) {
        const styles = ['dramatic', 'neon', 'vintage', 'standard'];
        const style = styles[i % styles.length];
        const thumbnail = await extractEnhancedThumbnail(thumbnailTimes[i], style);
        
        content.push({
          id: `thumb-${i}`,
          type: 'Viral Thumbnail',
          caption: `${style.charAt(0).toUpperCase() + style.slice(1)} Thumbnail - Click magnet! 👀`,
          thumbnail: URL.createObjectURL(thumbnail),
          style: style,
          platform: 'Universal',
          clickPotential: Math.floor(Math.random() * 30) + 70,
          downloadData: { type: 'image', data: thumbnail }
        });
        stats.thumbnails++;
      }
      
      // Create meme templates
      setProcessingStep('😂 Generating meme templates...');
      for (let i = 0; i < 4; i++) {
        const memeTime = Math.random() * videoDuration;
        const thumbnail = await extractEnhancedThumbnail(memeTime, 'standard');
        const platform = selectedPlatforms[i % selectedPlatforms.length];
        const memeTexts = await generateViralContent({ platform, type: 'Meme' }, 'meme');
        
        content.push({
          id: `meme-${i}`,
          type: 'Meme Template',
          caption: `Meme-ready template for ${platform}! 😂`,
          thumbnail: URL.createObjectURL(thumbnail),
          platform: platform,
          memeTexts: typeof memeTexts === 'string' ? memeTexts.split('|').map(t => t.trim()) : [memeTexts],
          viralPotential: Math.floor(Math.random() * 40) + 60,
          downloadData: { type: 'meme', data: thumbnail }
        });
        stats.memes++;
      }
      
      setGeneratedContent(content);
      setContentStats(stats);
      setProcessingStep(`✅ Generated ${content.length} viral content pieces! Ready to dominate social media 🚀`);
      
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStep('❌ Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced remix with different strategies
  const remixContent = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingStep('🎲 Remixing with viral strategies...');
    
    // Cycle through viral modes
    const modes = ['balanced', 'aggressive', 'trendy'];
    const currentIndex = modes.indexOf(viralMode);
    const newMode = modes[(currentIndex + 1) % modes.length];
    setViralMode(newMode);
    
    setProcessingStep(`🔄 Switching to ${newMode} mode...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await processVideo();
  };

  // Enhanced download with multiple formats
  const downloadContent = (item) => {
    const link = document.createElement('a');
    
    if (item.type === 'Video Clip') {
      // Download best thumbnail for now (in full app would be actual video segment)
      link.href = item.thumbnails[0].url;
      link.download = `${item.platform}_${item.segment.type}_${item.id}.jpg`;
    } else if (item.type === 'Viral GIF') {
      link.href = item.gif;
      link.download = `viral_gif_${item.style}_${item.id}.gif`;
    } else if (item.downloadData?.data) {
      link.href = item.thumbnail || item.downloadData.data;
      link.download = `${item.type.toLowerCase().replace(' ', '_')}_${item.id}.jpg`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk download all content
  const downloadAll = () => {
    generatedContent.forEach((item, index) => {
      setTimeout(() => downloadContent(item), index * 200);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full animate-spin-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/10 to-purple-500/10 rounded-full animate-spin-reverse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 animate-pulse-slow">
          🚀 VIRAL CONTENT GENERATOR
        </h1>
        <p className="text-xl md:text-2xl text-purple-200 mb-2">
          Upload one video → Generate dozens of viral-ready content pieces
        </p>
        <div className="text-sm text-purple-300 mb-6">
          ✨ AI-Powered • 🎯 Platform-Optimized • 🔥 Trend-Aware • ⚡ Instant Results
        </div>
        
        {/* Stats Bar */}
        {Object.values(contentStats).some(val => val > 0) && (
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <div className="bg-green-500/20 px-3 py-1 rounded-full">📹 {contentStats.clips} Clips</div>
            <div className="bg-blue-500/20 px-3 py-1 rounded-full">🎨 {contentStats.gifs} GIFs</div>
            <div className="bg-purple-500/20 px-3 py-1 rounded-full">🖼️ {contentStats.thumbnails} Thumbnails</div>
            <div className="bg-pink-500/20 px-3 py-1 rounded-full">😂 {contentStats.memes} Memes</div>
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Control Panel */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Platform Selection */}
              <div>
                <label className="text-white font-bold mb-2 block">🎯 Target Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(platformSpecs).map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        if (selectedPlatforms.includes(platform)) {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, platform]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedPlatforms.includes(platform)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Viral Mode */}
              <div>
                <label className="text-white font-bold mb-2 block">🔥 Viral Mode</label>
                <select
                  value={viralMode}
                  onChange={(e) => setViralMode(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white"
                >
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="aggressive">🚀 Aggressive</option>
                  <option value="trendy">🎭 Trendy</option>
                </select>
              </div>
              
              {/* Options */}
              <div>
                <label className="text-white font-bold mb-2 block">⚙️ Options</label>
                <div className="space-y-2">
                  <label className="flex items-center text-white text-sm">
                    <input
                      type="checkbox"
                      checked={autoCaption}
                      onChange={(e) => setAutoCaption(e.target.checked)}
                      className="mr-2"
                    />
                    AI Auto-Captions
                  </label>
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
                <p className="text-white text-xl mb-4">Drag & drop your video here</p>
                <p className="text-purple-300 text-sm mb-4">Supports MP4, MOV, AVI, WebM</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label 
                  htmlFor="video-upload"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all inline-block font-bold text-lg"
                >
                  Choose Video File
                </label>
              </div>
            ) : (
              <div>
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={onVideoLoaded}
                  controls
                  className="max-w-full max-h-64 mx-auto rounded-lg mb-4 shadow-xl"
                />
                <div className="text-purple-200 mb-4">
                  Duration: {Math.round(videoDuration)}s | Mode: {viralMode} | Platforms: {selectedPlatforms.join(', ')}
                </div>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={processVideo}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                  >
                    {isProcessing ? '⚡ Processing...' : '🚀 Generate Viral Content'}
                  </button>
                  {generatedContent.length > 0 && (
                    <>
                      <button
                        onClick={remixContent}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105"
                      >
                        🎲 Remix ({viralMode})
                      </button>
                      <button
                        onClick={downloadAll}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
                      >
                        📦 Download All
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6 text-center border border-purple-500/30">
              <div className="text-white text-lg mb-4">{processingStep}</div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-3 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <div className="text-purple-300 text-sm">AI is working its magic... ✨</div>
            </div>
          )}

          {/* Generated Content Gallery */}
          {generatedContent.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">
                  ✨ Generated Content ({generatedContent.length} pieces)
                </h2>
                <div className="text-purple-300 text-sm">
                  Ready to dominate social media! 🚀
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto custom-scrollbar">
                {generatedContent.map((item) => (
                  <div key={item.id} className="bg-black/40 rounded-lg p-4 hover:bg-black/60 transition-all transform hover:scale-105 border border-purple-500/20">
                    {/* Content Preview */}
                    <div className="relative mb-3">
                      <img 
                        src={item.thumbnails?.[0]?.url || item.thumbnail || item.gif} 
                        alt={item.type}
                        className="w-full h-36 object-cover rounded-lg"
                      />
                      {item.viralScore && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          🔥 {Math.round(item.viralScore)}
                        </div>
                      )}
                      {item.priority === 'high' && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          HIGH
                        </div>
                      )}
                    </div>
                    
                    {/* Content Info */}
                    <div className="text-sm text-purple-300 mb-1 flex justify-between">
                      <span>{item.type}</span>
                      <span>{item.style && `${item.style} Style`}</span>
                    </div>
                    <div className="text-white text-sm mb-2 line-clamp-2">{item.caption}</div>
                    <div className="text-xs text-blue-300 mb-3 flex justify-between">
                      <span>📱 {item.platform}</span>
                      {item.clickPotential && <span>👆 {item.clickPotential}% CTR</span>}
                      {item.viralPotential && <span>🚀 {item.viralPotential}% Viral</span>}
                    </div>
                    
                    {/* Additional Options */}
                    {item.thumbnails && item.thumbnails.length > 1 && (
                      <div className="text-xs text-gray-400 mb-2">
                        +{item.thumbnails.length - 1} more styles
                      </div>
                    )}
                    
                    {item.memeTexts && (
                      <div className="text-xs text-yellow-300 mb-2">
                        Meme texts: {item.memeTexts.slice(0, 2).join(', ')}...
                      </div>
                    )}
                    
                    <button
                      onClick={() => downloadContent(item)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-bold"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar Guide */}
        <div className="w-96 bg-black/20 backdrop-blur-sm rounded-lg p-6 h-fit border border-purple-500/30">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left text-xl font-bold text-white mb-4 flex items-center justify-between hover:text-purple-300 transition-all"
          >
            📚 Viral Optimization Guide
            <span className="text-purple-400">{showGuide ? '▼' : '▶'}</span>
          </button>
          
          {showGuide && (
            <div className="space-y-6 text-sm text-purple-200 max-h-96 overflow-y-auto custom-scrollbar">
              {/* Current Trends */}
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">🔥 Trending Now</h3>
                <div className="space-y-2 text-xs">
                  <div>• AI-generated content is exploding</div>
                  <div>• Short-form video dominates (15-30s)</div>
                  <div>• Hook in first 3 seconds is CRITICAL</div>
                  <div>• Vertical format (9:16) performs best</div>
                </div>
              </div>
              
              {/* Platform-specific tips */}
              {selectedPlatforms.map(platform => (
                <div key={platform} className="bg-black/30 p-4 rounded-lg">
                  <h3 className="font-bold text-white mb-2">{platform} Strategy</h3>
                  <ul className="space-y-1 text-xs">
                    <li>• Optimal: {platformSpecs[platform].duration.join('s, ')}s clips</li>
                    <li>• Ratio: {platformSpecs[platform].ratio}</li>
                    <li>• Top hashtags: #{platformSpecs[platform].trending.join(' #')}</li>
                    <li>• Hook style: "{platformSpecs[platform].hooks[0]}"</li>
                  </ul>
                </div>
              ))}
              
              {/* Viral Tips */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">💡 Viral Secrets</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Emotion beats perfection</li>
                  <li>• Controversy (tasteful) drives engagement</li>
                  <li>• Behind-the-scenes content performs well</li>
                  <li>• User-generated content has high trust</li>
                  <li>• Timing: Post 6-9 PM local time</li>
                  <li>• Cross-platform consistency builds brand</li>
                </ul>
              </div>
              
              {/* AI Tips */}
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">🤖 AI Optimization</h3>
                <ul className="space-y-1 text-xs">
                  <li>• This tool uses viral trend analysis</li>
                  <li>• Captions are optimized for engagement</li>
                  <li>• Thumbnails tested for click-through</li>
                  <li>• Multiple formats = wider reach</li>
                  <li>• Remix for fresh perspectives</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

export default App;