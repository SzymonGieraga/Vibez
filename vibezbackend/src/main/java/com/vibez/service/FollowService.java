package com.vibez.service;

import com.vibez.dto.UserFollowDto;
import com.vibez.model.Follow;
import com.vibez.model.User;
import com.vibez.repository.FollowRepository;
import com.vibez.repository.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private final InAppNotificationService inAppNotificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository, NotificationService notificationService, InAppNotificationService inAppNotificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.inAppNotificationService = inAppNotificationService;
    }

    @Transactional
    public boolean toggleFollow(String followerUsername, String followingUsername) {
        if(followingUsername.equals(followerUsername)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(()->new RuntimeException("Follower not found"));
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(()->new RuntimeException("Following not found"));
        Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(follower, following);

        if(existingFollow.isPresent()) {
            followRepository.delete(existingFollow.get());
            return false;
        }else{
            Follow follow = new Follow(follower, following);
            followRepository.save(follow);

            sendNewFollowerNotification(following, follower.getUsername());
            inAppNotificationService.createNewFollowerNotification(following, follower);

            return true;
        }
    }
    public boolean isFollowing(String followerUsername, String followingUsername) {
        User follower = userRepository.findByUsername(followerUsername).orElse(null);
        User following = userRepository.findByUsername(followingUsername).orElse(null);
        if(follower == null || following == null) {
            return false;
        }
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }
    public long getFollowersCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("User not found"));
        return followRepository.countByFollowing(user);
    }
    public long getFollowingCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("User not found"));
        return followRepository.countByFollower(user);
    }

    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowersDto(String profileUsername, String currentUsername) {
        User profileUser = userRepository.findByUsername(profileUsername)
                .orElseThrow(() -> new RuntimeException("Profile user not found"));

        Set<String> followingByCurrentUser = getFollowingUsernames(currentUsername);

        List<Follow> followerRelations = followRepository.findByFollowing(profileUser);

        return followerRelations.stream()
                .map(Follow::getFollower)
                .map(followerUser -> new UserFollowDto(
                        followerUser.getUsername(),
                        followerUser.getProfilePictureUrl(),
                        followingByCurrentUser.contains(followerUser.getUsername())
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowingDto(String profileUsername, String currentUsername) {
        User profileUser = userRepository.findByUsername(profileUsername)
                .orElseThrow(() -> new RuntimeException("Profile user not found"));

        Set<String> followingByCurrentUser = getFollowingUsernames(currentUsername);

        List<Follow> followingRelations = followRepository.findByFollower(profileUser);

        return followingRelations.stream()
                .map(Follow::getFollowing)
                .map(followingUser -> new UserFollowDto(
                        followingUser.getUsername(),
                        followingUser.getProfilePictureUrl(),
                        followingByCurrentUser.contains(followingUser.getUsername())
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    protected Set<String> getFollowingUsernames(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return followRepository.findByFollower(user).stream()
                .map(follow -> follow.getFollowing().getUsername())
                .collect(Collectors.toSet());
    }
    @Async
    public void sendNewFollowerNotification(User recipient, String actorUsername) {
        String title = "Masz nowego obserwującego!";
        String body = actorUsername + " zaczął Cię obserwować.";

        String relativeUrl = "/profile/" + actorUsername;
        notificationService.sendNotificationToUser(recipient, title, body, relativeUrl);
    }
}
