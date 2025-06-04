import { ethers } from 'ethers';
import type { BrowserProvider, Contract, Signer } from 'ethers';

// Contract ABI (Application Binary Interface)
export const TRUSTTOK_ABI = [
  "function createPost(string memory _content) external",
  "function likePost(uint256 _postId) external", 
  "function sharePost(uint256 _postId) external",
  "function getTotalPosts() external view returns (uint256)",
  "function getPost(uint256 _postId) external view returns (tuple(uint256 id, address author, string content, uint256 timestamp, uint256 likes, uint256 shares, uint256 trustScoreAtPost, bool isModerated, bool isApproved))",
  "function getUserProfile(address _user) external view returns (tuple(address userAddress, uint256 trustScore, uint8 level, uint256 totalPosts, uint256 totalLikes, bool canModerate, uint256 reputationEarned))",
  "function getContentBoost(address _user) external view returns (uint256)",
  "event PostCreated(uint256 indexed postId, address indexed author, uint256 trustScore)"
];

export const TRUSTTOK_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export class TrustTokContract {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private contract: Contract | null = null;

  async init() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      this.contract = new ethers.Contract(
        TRUSTTOK_ADDRESS,
        TRUSTTOK_ABI,
        this.signer
      );
      
      return true;
    }
    return false;
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return await this.init();
  }

  async createPost(content: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.createPost(content);
    const receipt = await tx.wait();
    return receipt;
  }

  async likePost(postId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.likePost(postId);
    const receipt = await tx.wait();
    return receipt;
  }

  async getTotalPosts() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const total = await this.contract.getTotalPosts();
    return Number(total);
  }

  // Mock function to simulate Graphite Trust Score for demo
  async getMockTrustScore(address: string): Promise<number> {
    const mockScores: { [key: string]: number } = {
      '0x1234567890123456789012345678901234567890': 85,
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 92,
      '0x9876543210987654321098765432109876543210': 45,
    };
    
    return mockScores[address] || Math.floor(50 + Math.random() * 50);
  }

  async getCurrentAccount(): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');
    return await this.signer.getAddress();
  }
}

// Global Web3 extension for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const trustTokContract = new TrustTokContract();
