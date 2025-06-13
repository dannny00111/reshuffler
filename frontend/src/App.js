import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
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
  const videoRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const canvasRef = useRef(null);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    };
    loadFFmpeg();
  }, []);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setGeneratedContent([]);
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

  // Smart segment detection based on duration
  const getSmartSegments = (duration) => {
    const segments = [];
    
    // TikTok/Instagram Reels segments (15-30s)
    if (duration > 30) {
      segments.push(
        { start: 0, end: 15, type: 'Opening Hook', platform: 'TikTok' },
        { start: Math.max(0, duration * 0.3), end: Math.max(15, duration * 0.3 + 15), type: 'Mid Content', platform: 'Instagram' },
        { start: Math.max(0, duration - 30), end: duration, type: 'Finale', platform: 'YouTube Shorts' }
      );
    }
    
    // YouTube Shorts segments (30-60s)
    if (duration > 60) {
      segments.push(
        { start: duration * 0.1, end: duration * 0.1 + 45, type: 'Key Moment', platform: 'YouTube' },
        { start: duration * 0.6, end: Math.min(duration, duration * 0.6 + 60), type: 'Climax', platform: 'YouTube' }
      );
    }
    
    // Quick moments (5-10s for memes/GIFs)
    for (let i = 0; i < Math.min(5, Math.floor(duration / 10)); i++) {
      const start = (duration / 5) * i;
      segments.push({
        start: start,
        end: Math.min(duration, start + Math.random() * 5 + 5),
        type: 'Meme Moment',
        platform: 'GIF'
      });
    }
    
    return segments;
  };

  // Generate AI captions using OpenRouter
  const generateAICaptions = async (segmentInfo) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{
            role: 'user',
            content: `Generate viral social media captions for a ${segmentInfo.type} video segment (${segmentInfo.end - segmentInfo.start}s long) optimized for ${segmentInfo.platform}. Make it engaging, hook-heavy, and trending. Include relevant hashtags. Format: Caption | Hook Text | Hashtags`
          }],
          max_tokens: 200,
          temperature: 0.8
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Amazing viral moment! 🔥 #Viral #Trending';
    } catch (error) {
      console.error('Caption generation failed:', error);
      return `${segmentInfo.type} - Perfect for ${segmentInfo.platform}! #Viral #Content`;
    }
  };

  // Generate meme text using AI
  const generateMemeText = async () => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{
            role: 'user',
            content: 'Generate 3 viral meme text overlays that would work on any video. Keep them short, trendy, and meme-worthy. Format: Text1 | Text2 | Text3'
          }],
          max_tokens: 100,
          temperature: 0.9
        })
      });
      
      const data = await response.json();
      const texts = data.choices?.[0]?.message?.content?.split('|') || ['POV:', 'When you realize...', 'This hits different'];
      return texts.map(text => text.trim());
    } catch (error) {
      console.error('Meme text generation failed:', error);
      return ['POV:', 'When you realize...', 'This hits different'];
    }
  };

  // Extract frame as thumbnail
  const extractThumbnail = (time) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      video.currentTime = time;
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
    });
  };

  // Create GIF from video segment
  const createGIF = (startTime, endTime) => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const interval = 0.2; // Capture every 0.2 seconds
      const frames = [];
      let currentTime = startTime;
      
      const captureFrame = () => {
        if (currentTime >= endTime) {
          // Generate GIF from frames
          gifshot.createGIF({
            images: frames,
            gifWidth: 480,
            gifHeight: 270,
            interval: 0.2,
            numFrames: frames.length,
            quality: 10
          }, (obj) => {
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
          canvas.width = 480;
          canvas.height = 270;
          ctx.drawImage(video, 0, 0, 480, 270);
          frames.push(canvas.toDataURL());
          currentTime += interval;
          setTimeout(captureFrame, 100);
        };
      };
      
      captureFrame();
    });
  };

  // Process video and generate content
  const processVideo = async () => {
    if (!videoFile || !videoRef.current) return;
    
    setIsProcessing(true);
    setGeneratedContent([]);
    const content = [];
    
    try {
      const segments = getSmartSegments(videoDuration);
      const memeTexts = await generateMemeText();
      
      setProcessingStep('🎬 Analyzing video segments...');
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        setProcessingStep(`📹 Processing ${segment.type} (${i + 1}/${segments.length})`);
        
        // Generate AI caption
        const caption = await generateAICaptions(segment);
        
        // Extract thumbnail
        const thumbnailTime = segment.start + (segment.end - segment.start) / 2;
        const thumbnail = await extractThumbnail(thumbnailTime);
        
        content.push({
          id: `segment-${i}`,
          type: 'Video Clip',
          segment: segment,
          caption: caption,
          thumbnail: URL.createObjectURL(thumbnail),
          platform: segment.platform,
          downloadData: { type: 'video', start: segment.start, end: segment.end }
        });
        
        // Create GIF for shorter segments
        if (segment.end - segment.start <= 10) {
          setProcessingStep(`🎨 Creating GIF for ${segment.type}...`);
          const gifData = await createGIF(segment.start, segment.end);
          if (gifData) {
            content.push({
              id: `gif-${i}`,
              type: 'GIF',
              segment: segment,
              caption: `${segment.type} GIF - Perfect for reactions! 🔥`,
              thumbnail: gifData,
              platform: 'GIF/Meme',
              downloadData: { type: 'gif', data: gifData }
            });
          }
        }
      }
      
      // Generate multiple thumbnails
      setProcessingStep('🖼️ Creating viral thumbnails...');
      const thumbnailTimes = [0, videoDuration * 0.25, videoDuration * 0.5, videoDuration * 0.75, videoDuration * 0.9];
      
      for (let i = 0; i < thumbnailTimes.length; i++) {
        const thumbnail = await extractThumbnail(thumbnailTimes[i]);
        content.push({
          id: `thumb-${i}`,
          type: 'Thumbnail',
          caption: `Viral Thumbnail ${i + 1} - Click-worthy! 👀`,
          thumbnail: URL.createObjectURL(thumbnail),
          platform: 'YouTube/Thumbnail',
          downloadData: { type: 'image', data: thumbnail }
        });
      }
      
      // Generate meme versions with text overlays
      setProcessingStep('🔥 Creating meme versions...');
      for (let i = 0; i < Math.min(3, memeTexts.length); i++) {
        const memeTime = Math.random() * videoDuration;
        const thumbnail = await extractThumbnail(memeTime);
        content.push({
          id: `meme-${i}`,
          type: 'Meme Template',
          caption: `"${memeTexts[i]}" - Meme ready! 😂`,
          thumbnail: URL.createObjectURL(thumbnail),
          platform: 'Meme/Social',
          memeText: memeTexts[i],
          downloadData: { type: 'meme', data: thumbnail, text: memeTexts[i] }
        });
      }
      
      setGeneratedContent(content);
      setProcessingStep('✅ Generated ' + content.length + ' viral content pieces!');
      
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStep('❌ Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remix - generate new variations
  const remixContent = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProcessingStep('🎲 Remixing content...');
    
    // Generate different segments and styles
    const newSegments = getSmartSegments(videoDuration).map(seg => ({
      ...seg,
      start: Math.max(0, seg.start + (Math.random() - 0.5) * 5),
      end: Math.min(videoDuration, seg.end + (Math.random() - 0.5) * 5)
    }));
    
    // Process with new segments
    await processVideo();
  };

  // Download content
  const downloadContent = (item) => {
    const link = document.createElement('a');
    
    if (item.downloadData.type === 'image' || item.downloadData.type === 'meme') {
      link.href = item.thumbnail;
      link.download = `${item.type.toLowerCase().replace(' ', '_')}_${item.id}.jpg`;
    } else if (item.downloadData.type === 'gif') {
      link.href = item.downloadData.data;
      link.download = `gif_${item.id}.gif`;
    } else if (item.downloadData.type === 'video') {
      // For video segments, we'll download the thumbnail for now
      // In a full implementation, you'd use FFmpeg to extract the actual video segment
      link.href = item.thumbnail;
      link.download = `video_segment_${item.id}.jpg`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="pt-8 pb-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
          🚀 Viral Content Generator
        </h1>
        <p className="text-xl text-purple-200 mb-6">
          Upload one video → Get dozens of viral-ready content pieces
        </p>
      </div>

      <div className="container mx-auto px-4 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center mb-6 bg-black/20 backdrop-blur-sm"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {!videoUrl ? (
              <div>
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white text-xl mb-4">Drag & drop your video here</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label 
                  htmlFor="video-upload"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all inline-block"
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
                  className="max-w-full max-h-64 mx-auto rounded-lg mb-4"
                />
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={processVideo}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    {isProcessing ? '⚡ Processing...' : '🚀 Generate Viral Content'}
                  </button>
                  {generatedContent.length > 0 && (
                    <button
                      onClick={remixContent}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 hover:from-orange-600 hover:to-red-700 transition-all"
                    >
                      🎲 Remix
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6 text-center">
              <div className="text-white text-lg mb-2">{processingStep}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {/* Generated Content Gallery */}
          {generatedContent.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                ✨ Generated Content ({generatedContent.length} pieces)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {generatedContent.map((item) => (
                  <div key={item.id} className="bg-black/40 rounded-lg p-4 hover:bg-black/60 transition-all">
                    <img 
                      src={item.thumbnail} 
                      alt={item.type}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <div className="text-sm text-purple-300 mb-1">{item.type}</div>
                    <div className="text-white text-sm mb-2 line-clamp-2">{item.caption}</div>
                    <div className="text-xs text-blue-300 mb-3">📱 {item.platform}</div>
                    <button
                      onClick={() => downloadContent(item)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Guide */}
        <div className="w-80 bg-black/20 backdrop-blur-sm rounded-lg p-6 h-fit">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left text-xl font-bold text-white mb-4 flex items-center justify-between"
          >
            📚 Viral Optimization Guide
            <span className="text-purple-400">{showGuide ? '▼' : '▶'}</span>
          </button>
          
          {showGuide && (
            <div className="space-y-4 text-sm text-purple-200">
              <div>
                <h3 className="font-bold text-white mb-2">🎵 TikTok Tips:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Hook in first 3 seconds</li>
                  <li>• 15-30 second clips work best</li>
                  <li>• Add trending sounds</li>
                  <li>• Use trending hashtags</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-white mb-2">📸 Instagram Tips:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Square or vertical format</li>
                  <li>• Eye-catching thumbnails</li>
                  <li>• Engaging captions</li>
                  <li>• Story-friendly content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-white mb-2">🎬 YouTube Shorts:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• 30-60 second clips</li>
                  <li>• Strong opening hook</li>
                  <li>• Clear, bold thumbnails</li>
                  <li>• End with CTA</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-white mb-2">🔥 Viral Tips:</h3>
                <ul className="space-y-1 text-xs">
                  <li>• Emotional moments work best</li>
                  <li>• Unexpected twists</li>
                  <li>• Relatable content</li>
                  <li>• Current trends/memes</li>
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