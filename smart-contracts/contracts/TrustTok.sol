// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Graphite Network Trust Score Interface (moved outside contract)
interface IGraphiteTrustScore {
    function getTrustScore(address user) external view returns (uint256);
    function isVerified(address user) external view returns (bool);
}

contract TrustTok is Ownable, ReentrancyGuard {
    
    // Use regular uint256 counters instead of Counters library
    uint256 private _postIds;
    uint256 private _userIds;
    
    // Trust levels
    enum TrustLevel { LOW, MEDIUM, HIGH, PREMIUM }
    
    // Content post structure
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        uint256 shares;
        uint256 trustScoreAtPost;
        bool isModerated;
        bool isApproved;
    }
    
    // User profile structure
    struct UserProfile {
        address userAddress;
        uint256 trustScore;
        TrustLevel level;
        uint256 totalPosts;
        uint256 totalLikes;
        bool canModerate;
        uint256 reputationEarned;
    }
    
    // State variables
    IGraphiteTrustScore public graphiteTrustScore;
    mapping(uint256 => Post) public posts;
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => bool) public moderators;
    
    // Content boost multipliers based on trust level
    mapping(TrustLevel => uint256) public boostMultipliers;
    
    // Events
    event PostCreated(uint256 indexed postId, address indexed author, uint256 trustScore);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostShared(uint256 indexed postId, address indexed sharer);
    event TrustScoreUpdated(address indexed user, uint256 newScore, TrustLevel newLevel);
    event ContentModerated(uint256 indexed postId, address indexed moderator, bool approved);
    event ReputationEarned(address indexed user, uint256 amount, string reason);
    
    constructor(address _graphiteTrustScore) Ownable(msg.sender) {
        graphiteTrustScore = IGraphiteTrustScore(_graphiteTrustScore);
        
        // Set boost multipliers
        boostMultipliers[TrustLevel.LOW] = 1;
        boostMultipliers[TrustLevel.MEDIUM] = 2;
        boostMultipliers[TrustLevel.HIGH] = 3;
        boostMultipliers[TrustLevel.PREMIUM] = 5;
        
        // Owner is initial moderator
        moderators[msg.sender] = true;
    }
    
    // Create a new post
    function createPost(string memory _content) external nonReentrant {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 280, "Content too long");
        
        uint256 trustScore = graphiteTrustScore.getTrustScore(msg.sender);
        TrustLevel level = getTrustLevel(trustScore);
        
        _postIds++;
        uint256 newPostId = _postIds;
        
        bool autoApproved = trustScore >= 80;
        
        posts[newPostId] = Post({
            id: newPostId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            likes: 0,
            shares: 0,
            trustScoreAtPost: trustScore,
            isModerated: autoApproved,
            isApproved: autoApproved
        });
        
        updateUserProfile(msg.sender, trustScore, level);
        userProfiles[msg.sender].totalPosts++;
        
        emit PostCreated(newPostId, msg.sender, trustScore);
        
        if (autoApproved) {
            earnReputation(msg.sender, 10, "High trust auto-approval");
        }
    }
    
    function likePost(uint256 _postId) external {
        require(_postId <= _postIds, "Post does not exist");
        require(!postLikes[_postId][msg.sender], "Already liked");
        require(posts[_postId].isApproved, "Post not approved");
        
        postLikes[_postId][msg.sender] = true;
        posts[_postId].likes++;
        userProfiles[posts[_postId].author].totalLikes++;
        
        emit PostLiked(_postId, msg.sender);
        earnReputation(posts[_postId].author, 1, "Post liked");
    }
    
    function sharePost(uint256 _postId) external {
        require(_postId <= _postIds, "Post does not exist");
        require(posts[_postId].isApproved, "Post not approved");
        
        posts[_postId].shares++;
        emit PostShared(_postId, msg.sender);
        earnReputation(posts[_postId].author, 2, "Post shared");
    }
    
    function moderatePost(uint256 _postId, bool _approve) external {
        require(_postId <= _postIds, "Post does not exist");
        
        uint256 moderatorTrustScore = graphiteTrustScore.getTrustScore(msg.sender);
        require(
            moderators[msg.sender] || moderatorTrustScore >= 70,
            "Insufficient moderation privileges"
        );
        
        posts[_postId].isModerated = true;
        posts[_postId].isApproved = _approve;
        
        emit ContentModerated(_postId, msg.sender, _approve);
        earnReputation(msg.sender, 5, "Content moderation");
    }
    
    function updateUserProfile(address _user, uint256 _trustScore, TrustLevel _level) internal {
        userProfiles[_user].userAddress = _user;
        userProfiles[_user].trustScore = _trustScore;
        userProfiles[_user].level = _level;
        userProfiles[_user].canModerate = _trustScore >= 70;
        
        emit TrustScoreUpdated(_user, _trustScore, _level);
    }
    
    function getTrustLevel(uint256 _trustScore) public pure returns (TrustLevel) {
        if (_trustScore >= 90) return TrustLevel.PREMIUM;
        if (_trustScore >= 70) return TrustLevel.HIGH;
        if (_trustScore >= 40) return TrustLevel.MEDIUM;
        return TrustLevel.LOW;
    }
    
    function earnReputation(address _user, uint256 _amount, string memory _reason) internal {
        userProfiles[_user].reputationEarned += _amount;
        emit ReputationEarned(_user, _amount, _reason);
    }
    
    function getContentBoost(address _user) external view returns (uint256) {
        uint256 trustScore = graphiteTrustScore.getTrustScore(_user);
        TrustLevel level = getTrustLevel(trustScore);
        return boostMultipliers[level];
    }
    
    function addModerator(address _moderator) external onlyOwner {
        moderators[_moderator] = true;
    }
    
    function removeModerator(address _moderator) external onlyOwner {
        moderators[_moderator] = false;
    }
    
    function updateGraphiteTrustScore(address _newAddress) external onlyOwner {
        graphiteTrustScore = IGraphiteTrustScore(_newAddress);
    }
    
    function getTotalPosts() external view returns (uint256) {
        return _postIds;
    }
    
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }
    
    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId <= _postIds, "Post does not exist");
        return posts[_postId];
    }
}
