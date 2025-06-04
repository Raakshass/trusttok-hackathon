import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Star, TrendingUp, Users, MessageCircle, Heart, Share2, Wallet } from 'lucide-react';
import { trustTokContract } from './contracts/TrustTok';
import './App.css';

interface TrustData {
  address: string;
  trustScore: number;
  level: string;
  benefits: {
    contentBoost: number;
    monetizationTier: string;
    canModerate: boolean;
  };
}

interface ContentItem {
  id: string;
  userAddress: string;
  content: string;
  trustScore: number;
  boostMultiplier: number;
  likes: number;
  shares: number;
  timestamp: string;
  isBlockchain?: boolean;
}

const App: React.FC = () => {
  const [userAddress, setUserAddress] = useState('0x1234567890123456789012345678901234567890');
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [newPost, setNewPost] = useState('');
  const [contentFeed, setContentFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);

  // Mock content feed data
  const mockContent: ContentItem[] = [
    {
      id: '1',
      userAddress: '0x1234567890123456789012345678901234567890',
      content: '🚀 Just launched my new DeFi project! Building the future of decentralized finance with complete transparency.',
      trustScore: 85,
      boostMultiplier: 3,
      likes: 1250,
      shares: 340,
      timestamp: '2h ago'
    },
    {
      id: '2',
      userAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      content: 'Sharing my research on blockchain scalability solutions. Layer 2 is the way forward! 📊',
      trustScore: 92,
      boostMultiplier: 3,
      likes: 890,
      shares: 156,
      timestamp: '4h ago'
    },
    {
      id: '3',
      userAddress: '0x9876543210987654321098765432109876543210',
      content: 'Quick crypto tip: Always DYOR before investing! 💡',
      trustScore: 45,
      boostMultiplier: 1,
      likes: 23,
      shares: 5,
      timestamp: '6h ago'
    }
  ];

  useEffect(() => {
    fetchTrustData();
    setContentFeed(mockContent);
    checkWeb3Connection();
  }, [userAddress]);

  const checkWeb3Connection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setUserAddress(accounts[0]);
          await trustTokContract.init();
          setIsWeb3Connected(true);
        }
      } catch (error) {
        console.error('Error checking Web3 connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      setWeb3Loading(true);
      const connected = await trustTokContract.connectWallet();
      
      if (connected) {
        const account = await trustTokContract.getCurrentAccount();
        setConnectedWallet(account);
        setUserAddress(account);
        setIsWeb3Connected(true);
        
        // Fetch blockchain-based trust score
        const blockchainTrustScore = await trustTokContract.getMockTrustScore(account);
        console.log('Blockchain Trust Score:', blockchainTrustScore);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Make sure MetaMask is installed!');
    } finally {
      setWeb3Loading(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setIsWeb3Connected(false);
    setUserAddress('0x1234567890123456789012345678901234567890');
  };

  const fetchTrustData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/trust-score/${userAddress}`);
      setTrustData(response.data);
    } catch (error) {
      console.error('Error fetching trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      if (isWeb3Connected && connectedWallet) {
        // Submit to blockchain
        setWeb3Loading(true);
        const receipt = await trustTokContract.createPost(newPost);
        console.log('Blockchain post created:', receipt);
        
        // Add blockchain post to feed
        const blockchainPost: ContentItem = {
          id: `blockchain_${Date.now()}`,
          userAddress: connectedWallet,
          content: newPost + ' 🔗 [On-Chain]',
          trustScore: trustData?.trustScore || 0,
          boostMultiplier: trustData?.benefits.contentBoost || 1,
          likes: 0,
          shares: 0,
          timestamp: 'now',
          isBlockchain: true
        };
        
        setContentFeed([blockchainPost, ...contentFeed]);
        setNewPost('');
      } else {
        // Submit to traditional API
        const response = await axios.post('http://localhost:5000/api/content/submit', {
          userAddress,
          content: newPost,
          contentType: 'post'
        });
        
        console.log('API post submitted:', response.data);
        
        const newContentItem: ContentItem = {
          id: response.data.contentId,
          userAddress,
          content: newPost,
          trustScore: trustData?.trustScore || 0,
          boostMultiplier: trustData?.benefits.contentBoost || 1,
          likes: 0,
          shares: 0,
          timestamp: 'now'
        };
        
        setContentFeed([newContentItem, ...contentFeed]);
        setNewPost('');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to submit post. Please try again.');
    } finally {
      setWeb3Loading(false);
    }
  };

  const likePostOnChain = async (postId: string) => {
    if (!isWeb3Connected) return;
    
    try {
      setWeb3Loading(true);
      
      // Extract numeric ID for blockchain posts
      const numericId = postId.startsWith('blockchain_') ? 1 : parseInt(postId);
      await trustTokContract.likePost(numericId);
      
      // Update local state
      setContentFeed(contentFeed.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post on chain:', error);
    } finally {
      setWeb3Loading(false);
    }
  };

  const getTrustBadgeColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🎭 TrustTok</h1>
          <p>Reputation-Based Social Media Platform powered by Graphite Network</p>
          
          {/* Web3 Connection Status */}
          <div className="web3-status">
            {!connectedWallet ? (
              <button 
                onClick={connectWallet} 
                disabled={web3Loading}
                className="connect-wallet-btn"
              >
                <Wallet size={20} />
                {web3Loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <Shield size={16} color="#10b981" />
                  <span>Connected: {formatAddress(connectedWallet)}</span>
                  <span className="blockchain-badge">⛓️ On-Chain</span>
                </div>
                <button onClick={disconnectWallet} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* User Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <Shield size={40} color="#3b82f6" />
              <div>
                <h3>Your Profile</h3>
                <p>{formatAddress(userAddress)}</p>
                {isWeb3Connected && (
                  <span className="web3-indicator">🔗 Blockchain Connected</span>
                )}
              </div>
            </div>
            
            {loading ? (
              <p>Loading trust data...</p>
            ) : trustData ? (
              <div className="trust-info">
                <div className="trust-score" style={{ borderColor: getTrustBadgeColor(trustData.trustScore) }}>
                  <Star size={24} color={getTrustBadgeColor(trustData.trustScore)} />
                  <span className="score">{trustData.trustScore}</span>
                  <span className="level">{trustData.level.toUpperCase()}</span>
                </div>
                
                <div className="benefits">
                  <h4>Your Benefits:</h4>
                  <div className="benefit-item">
                    <TrendingUp size={16} />
                    <span>{trustData.benefits.contentBoost}x Content Boost</span>
                  </div>
                  <div className="benefit-item">
                    <Star size={16} />
                    <span>{trustData.benefits.monetizationTier} Monetization</span>
                  </div>
                  {trustData.benefits.canModerate && (
                    <div className="benefit-item">
                      <Shield size={16} />
                      <span>Moderation Powers</span>
                    </div>
                  )}
                  {isWeb3Connected && (
                    <div className="benefit-item blockchain-benefit">
                      <span>⛓️ Blockchain Integration Active</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Content Creation */}
        <div className="content-section">
          <div className="post-creator">
            <h3>Create Post {isWeb3Connected && '(Blockchain Powered)'}</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={
                isWeb3Connected 
                  ? "Share your thoughts on-chain... Higher trust score = wider reach!" 
                  : "Share your thoughts... Higher trust score = wider reach!"
              }
              rows={3}
            />
            <div className="post-actions">
              <div className="boost-info">
                {trustData && (
                  <span>
                    🚀 Your content will get {trustData.benefits.contentBoost}x boost!
                    {isWeb3Connected && ' ⛓️ Posted on blockchain!'}
                  </span>
                )}
              </div>
              <button 
                onClick={submitPost} 
                disabled={!newPost.trim() || web3Loading}
                className={isWeb3Connected ? 'blockchain-post-btn' : ''}
              >
                {web3Loading ? 'Posting...' : isWeb3Connected ? 'Post to Blockchain' : 'Post to TrustTok'}
              </button>
            </div>
          </div>

          {/* Content Feed */}
          <div className="content-feed">
            <h3>🔥 Trending Content (Trust-Ranked)</h3>
            {contentFeed.map((item) => (
              <div key={item.id} className={`content-item ${item.isBlockchain ? 'blockchain-post' : ''}`}>
                <div className="content-header">
                  <div className="user-info">
                    <div className="user-avatar" style={{ backgroundColor: getTrustBadgeColor(item.trustScore) }}>
                      {item.userAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <span className="username">{formatAddress(item.userAddress)}</span>
                      <div className="trust-badge" style={{ color: getTrustBadgeColor(item.trustScore) }}>
                        <Shield size={12} />
                        {item.trustScore} Trust
                        {item.isBlockchain && <span className="chain-indicator">⛓️</span>}
                      </div>
                    </div>
                  </div>
                  <div className="boost-indicator">
                    {item.boostMultiplier > 1 && (
                      <span className="boost-badge">{item.boostMultiplier}x Boost</span>
                    )}
                    <span className="timestamp">{item.timestamp}</span>
                  </div>
                </div>
                
                <div className="content-body">
                  <p>{item.content}</p>
                </div>
                
                <div className="content-actions">
                  <button 
                    className="action-btn"
                    onClick={() => item.isBlockchain ? likePostOnChain(item.id) : null}
                    disabled={web3Loading}
                  >
                    <Heart size={16} />
                    {item.likes}
                    {item.isBlockchain && ' ⛓️'}
                  </button>
                  <button className="action-btn">
                    <MessageCircle size={16} />
                    Comment
                  </button>
                  <button className="action-btn">
                    <Share2 size={16} />
                    {item.shares}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
