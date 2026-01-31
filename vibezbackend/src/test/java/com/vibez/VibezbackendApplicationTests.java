package com.vibez;

import com.vibez.model.Like;
import com.vibez.model.Playlist;
import com.vibez.model.PlaylistReel;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.LikeRepository;
import com.vibez.repository.PlaylistReelRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.ImageStorageService;
import com.vibez.service.RecommendationService;
import com.vibez.service.ReelPreviewService;
import com.vibez.service.ReelService;
import com.vibez.service.TagService;
import com.vibez.service.VideoStorageService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VibezbackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    // Mocki globalne dla kontekstu Springa (używane w testach integracyjnych)
    @MockitoBean
    private ReelService reelService;

    @MockitoBean
    private ReelRepository reelRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private VideoStorageService videoStorageService;

    @MockitoBean
    private ImageStorageService imageStorageService;

    @MockitoBean
    private TagService tagService;

    @MockitoBean
    private ReelPreviewService reelPreviewService;

    @MockitoBean
    private RecommendationService recommendationService;

    @Nested
    @DisplayName("6.1.1. Testy jednostkowe")
    class UnitTests {

        @Mock
        private ReelRepository reelRepositoryUnit;

        @Mock
        private UserRepository userRepositoryUnit;

        @Mock
        private LikeRepository likeRepositoryUnit;

        @Mock
        private PlaylistReelRepository playlistReelRepositoryUnit;

        private ReelService reelServiceUnit;

        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);
            reelServiceUnit = new ReelService(
                    reelRepositoryUnit,
                    userRepositoryUnit,
                    likeRepositoryUnit,
                    playlistReelRepositoryUnit
            );
        }

        @Test
        public void likeReel_ShouldIncrementLikeCount_WhenNotLikedYet() {
            Long reelId = 1L;
            String username = "testUser";
            User user = new User();
            user.setUsername(username);
            Reel reel = new Reel();
            reel.setId(reelId);
            reel.setLikeCount(0);

            when(userRepositoryUnit.findByUsername(username)).thenReturn(Optional.of(user));
            when(reelRepositoryUnit.findById(reelId)).thenReturn(Optional.of(reel));
            when(likeRepositoryUnit.existsByUserAndReel(user, reel)).thenReturn(false);
            when(reelRepositoryUnit.save(any(Reel.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Reel result = reelServiceUnit.likeReel(reelId, username);

            Assertions.assertEquals(1, result.getLikeCount());
            verify(likeRepositoryUnit, times(1)).save(any(Like.class));
            verify(reelRepositoryUnit, times(1)).save(reel);
        }

        @Test
        public void likeReel_ShouldDoNothing_WhenAlreadyLiked() {
            Long reelId = 1L;
            String username = "testUser";
            User user = new User();
            Reel reel = new Reel();

            when(userRepositoryUnit.findByUsername(username)).thenReturn(Optional.of(user));
            when(reelRepositoryUnit.findById(reelId)).thenReturn(Optional.of(reel));
            when(likeRepositoryUnit.existsByUserAndReel(user, reel)).thenReturn(true);

            Reel result = reelServiceUnit.likeReel(reelId, username);

            verify(likeRepositoryUnit, never()).save(any(Like.class));
            Assertions.assertEquals(reel, result);
        }

        @Test
        public void unlikeReel_ShouldDecrementLikeCount_WhenLiked() {
            Long reelId = 1L;
            String username = "testUser";
            User user = new User();
            Reel reel = new Reel();
            reel.setLikeCount(5);
            Like like = new Like(user, reel);

            when(userRepositoryUnit.findByUsername(username)).thenReturn(Optional.of(user));
            when(reelRepositoryUnit.findById(reelId)).thenReturn(Optional.of(reel));
            when(likeRepositoryUnit.findByUserAndReel(user, reel)).thenReturn(Optional.of(like));
            when(reelRepositoryUnit.save(any(Reel.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Reel result = reelServiceUnit.unlikeReel(reelId, username);

            Assertions.assertEquals(4, result.getLikeCount());
            verify(likeRepositoryUnit, times(1)).delete(like);
        }

        @Test
        public void getPlaylistsForReel_ShouldReturnOnlyAllowedPlaylists() {
            Long reelId = 10L;
            String reqUsername = "requester";
            User requester = new User();
            requester.setUsername(reqUsername);

            User owner = new User();
            owner.setUsername("owner");

            Reel reel = new Reel();

            Playlist publicPlaylist = new Playlist();
            publicPlaylist.setName("PublicP");
            publicPlaylist.setPublic(true);
            publicPlaylist.setOwner(owner);

            Playlist privatePlaylist = new Playlist();
            privatePlaylist.setName("PrivateP");
            privatePlaylist.setPublic(false);
            privatePlaylist.setOwner(owner);

            PlaylistReel pr1 = new PlaylistReel();
            pr1.setPlaylist(publicPlaylist);
            PlaylistReel pr2 = new PlaylistReel();
            pr2.setPlaylist(privatePlaylist);

            when(reelRepositoryUnit.findById(reelId)).thenReturn(Optional.of(reel));
            when(userRepositoryUnit.findByUsername(reqUsername)).thenReturn(Optional.of(requester));
            when(playlistReelRepositoryUnit.findByReel(reel)).thenReturn(List.of(pr1, pr2));

            List<String> result = reelServiceUnit.getPlaylistsForReel(reelId, reqUsername);

            Assertions.assertEquals(1, result.size());
            Assertions.assertTrue(result.contains("PublicP"));
            Assertions.assertFalse(result.contains("PrivateP"));
        }
    }

    @Nested
    @DisplayName("6.1.2. Testy integracyjne")
    class IntegrationTests {

        @Test
        @WithMockUser
        public void getFeed_ShouldReturnListOfReels() throws Exception {
            Reel reel1 = new Reel();
            reel1.setId(1L);
            reel1.setDescription("Test Reel 1");

            Reel reel2 = new Reel();
            reel2.setId(2L);
            reel2.setDescription("Test Reel 2");

            List<Reel> reels = Arrays.asList(reel1, reel2);

            given(reelService.getAllReelsWithTopLevelComments()).willReturn(reels);

            mockMvc.perform(get("/api/reels/feed"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.size()").value(2))
                    .andExpect(jsonPath("$[0].description").value("Test Reel 1"));
        }

        @Test
        @WithMockUser
        public void likeReel_ShouldReturnOk_WhenReelExists() throws Exception {
            Long reelId = 100L;
            String username = "user1";
            Reel likedReel = new Reel();
            likedReel.setId(reelId);
            likedReel.setLikeCount(1);

            given(reelService.likeReel(reelId, username)).willReturn(likedReel);

            mockMvc.perform(post("/api/reels/{reelId}/like", reelId)
                            .param("username", username)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(reelId))
                    .andExpect(jsonPath("$.likeCount").value(1));
        }

        @Test
        @WithMockUser
        public void unlikeReel_ShouldReturnOk_WhenReelExists() throws Exception {
            Long reelId = 100L;
            String username = "user1";
            Reel unlikedReel = new Reel();
            unlikedReel.setId(reelId);
            unlikedReel.setLikeCount(0);

            given(reelService.unlikeReel(reelId, username)).willReturn(unlikedReel);

            mockMvc.perform(delete("/api/reels/{reelId}/like", reelId)
                            .param("username", username)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.likeCount").value(0));
        }

        @Test
        @WithMockUser
        public void getReelsByUsername_ShouldReturnUserReels() throws Exception {
            String username = "creator";
            User user = new User();
            user.setUsername(username);
            Reel reel = new Reel();
            reel.setId(5L);

            given(userRepository.findByUsername(username)).willReturn(Optional.of(user));
            given(reelService.getReelsByUserWithTopLevelComments(user)).willReturn(List.of(reel));

            mockMvc.perform(get("/api/reels/user/{username}", username))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(5));
        }
    }
}