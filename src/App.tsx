/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef, MouseEvent, ChangeEvent } from 'react';
import { Search, Heart, Play, ArrowLeft, Tv, Info, Menu, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js';
import channelsData from './channels.json';

interface Channel {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string;
  category: string;
}

const CATEGORIES = ['All', 'Sports', 'Entertainment', 'News', 'Movies', 'Infotainment', 'Music', 'Kids'];

export default function App() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('jiotv_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('jiotv_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const filteredChannels = useMemo(() => {
    return (channelsData as Channel[]).filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
      const matchesFavorite = !showFavoritesOnly || favorites.includes(channel.id);
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [searchQuery, activeCategory, showFavoritesOnly, favorites]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {!selectedChannel ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-20"
          >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-bottom border-zinc-800/50">
              <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Tv className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight hidden sm:block">JioTV <span className="text-blue-500 font-light">Clone</span></h1>
                </div>

                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                  />
                </div>

                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                    showFavoritesOnly ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  <span className="text-xs font-semibold pr-1 hidden lg:block">Favorites</span>
                </button>
              </div>

              {/* Categories */}
              <div className="border-t border-zinc-900 py-3 overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-4 flex gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        activeCategory === cat 
                          ? 'bg-zinc-100 text-zinc-950' 
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Grid */}
            <main className="max-w-7xl mx-auto px-4 mt-8">
              {filteredChannels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {filteredChannels.map((channel, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className="group relative cursor-pointer"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all group-hover:border-blue-500/50 group-hover:scale-[1.02]">
                        <img 
                          src={channel.logo} 
                          alt={channel.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => toggleFavorite(channel.id, e)}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                            favorites.includes(channel.id) 
                              ? 'bg-blue-600/90 text-white' 
                              : 'bg-zinc-950/60 text-white/50 hover:text-white lg:opacity-0 lg:group-hover:opacity-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(channel.id) ? 'fill-current' : ''}`} />
                        </button>
                        
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-950/60 backdrop-blur-sm rounded text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                          {channel.category}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h3 className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">{channel.name}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <Tv className="w-16 h-16 mb-4 opacity-20" />
                  <p>No channels found</p>
                </div>
              )}
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
          >
            {/* Player Header */}
            <header className="h-16 px-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChannel(null)}
                  className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={selectedChannel.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h2 className="font-bold text-lg">{selectedChannel.name}</h2>
                </div>
              </div>
              <button
                onClick={(e) => toggleFavorite(selectedChannel.id, e as any)}
                className={`p-2 rounded-full transition-all ${
                  favorites.includes(selectedChannel.id) ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-100'
                }`}
              >
                <Heart className={`w-6 h-6 ${favorites.includes(selectedChannel.id) ? 'fill-current' : ''}`} />
              </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Player Container */}
              <div className="flex-1 bg-black flex items-center justify-center relative">
                <VideoPlayer url={selectedChannel.url} channelName={selectedChannel.name} />
              </div>

              {/* Sidebar Info */}
              <div className="w-full lg:w-[400px] bg-zinc-900/50 p-6 overflow-y-auto no-scrollbar">
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-500/20">
                        {selectedChannel.category}
                      </span>
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase tracking-widest border border-green-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">{selectedChannel.name}</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedChannel.description}
                    </p>
                  </section>

                  <div className="h-px bg-zinc-800" />

                  <section>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      More Like This
                    </h4>
                    <div className="space-y-3">
                      {(channelsData as Channel[])
                        .filter(c => c.category === selectedChannel.category && c.id !== selectedChannel.id)
                        .slice(0, 4)
                        .map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => setSelectedChannel(c)}
                            className="flex gap-3 group cursor-pointer p-2 -m-2 rounded-xl hover:bg-zinc-800 transition-colors"
                          >
                            <div className="w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                              <img src={c.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <p className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">{c.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase mt-1">{c.category}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoPlayer({ url, channelName }: { url: string; channelName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (!newMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleDoubleClick = (e: MouseEvent) => {
    if (!videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      videoRef.current.currentTime -= 10;
    } else {
      videoRef.current.currentTime += 10;
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', () => setIsBuffering(false));

    if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Autoplay failed", e));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => video.play());
    }

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [url]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full bg-black group overflow-hidden flex items-center justify-center select-none"
    >
      <video
        ref={videoRef}
        onClick={togglePlay}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full max-h-[90vh] cursor-pointer"
        playsInline
      />

      {/* Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          >
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 flex flex-col justify-between"
          >
            {/* Top Bar */}
            <div className="p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg drop-shadow-md flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {channelName}
                </h3>
                <p className="text-zinc-300 text-xs font-medium px-4">Live Streaming</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                  1080P HD
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent py-10">
              <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-5">
                  <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                    {isPlaying ? <span className="w-8 h-8 flex items-center justify-center"><div className="w-1.5 h-6 bg-current rounded-full mx-0.5" /><div className="w-1.5 h-6 bg-current rounded-full mx-0.5" /></span> : <Play className="w-8 h-8 fill-current" />}
                  </button>
                  
                  <div className="flex items-center gap-2 group/volume">
                    <button onClick={toggleMute} className="text-white/80 hover:text-white">
                      {isMuted || volume === 0 ? <Tv className="w-6 h-6 opacity-50" /> : <Info className="w-6 h-6" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-zinc-600 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <button className="text-white/80 hover:text-white transition-colors">
                    <Info className="w-6 h-6" />
                  </button>
                  <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
                    {isFullscreen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
