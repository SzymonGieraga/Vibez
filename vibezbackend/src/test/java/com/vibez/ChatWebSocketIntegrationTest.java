package com.vibez;

import com.vibez.config.AuthChannelInterceptor;
import com.vibez.dto.ChatMessageDto;
import com.vibez.model.ChatMessage;
import com.vibez.model.ChatRoom;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import com.vibez.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "server.ssl.enabled=false")
public class ChatWebSocketIntegrationTest {

    @LocalServerPort
    private Integer port;

    private WebSocketStompClient stompClient;

    @MockitoBean
    private ChatService chatService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private AuthChannelInterceptor authChannelInterceptor;

    @BeforeEach
    public void setup() {
        StandardWebSocketClient simpleWebSocketClient = new StandardWebSocketClient();
        stompClient = new WebSocketStompClient(simpleWebSocketClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        when(authChannelInterceptor.preSend(any(Message.class), any(MessageChannel.class)))
                .thenAnswer(invocation -> {
                    Message<?> message = invocation.getArgument(0);

                    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        Principal user = new UsernamePasswordAuthenticationToken("testUser", null, Collections.emptyList());
                        accessor.setUser(user);

                        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
                    }

                    return message;
                });
    }

    @Test
    public void testSendMessageFlow() throws Exception {
        String username = "testUser";
        UUID chatId = UUID.randomUUID();
        String content = "Hello WebSocket!";
        Long reelId = 100L;

        User user = new User();
        user.setUsername(username);
        user.setId(1L);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setId(chatId);

        Reel reel = new Reel();
        reel.setId(reelId);

        ChatMessage savedMessage = new ChatMessage();
        savedMessage.setId(UUID.randomUUID());
        savedMessage.setContent(content);
        savedMessage.setSender(user);
        savedMessage.setChatRoom(chatRoom);
        savedMessage.setReel(reel);
        savedMessage.setTimestamp(LocalDateTime.now());
        savedMessage.setEdited(false);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        when(chatService.saveMessage(eq(chatId), any(User.class), eq(content), eq(reelId)))
                .thenReturn(savedMessage);

        when(chatService.getChatParticipants(chatId)).thenReturn(List.of(user));

        String wsUrl = "ws://localhost:" + port + "/ws";
        BlockingQueue<ChatMessageDto> blockingQueue = new LinkedBlockingDeque<>();

        StompSession session = stompClient
                .connectAsync(wsUrl, new StompSessionHandlerAdapter() {})
                .get(1, TimeUnit.SECONDS);

        session.subscribe("/user/queue/chat-messages", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessageDto.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((ChatMessageDto) payload);
            }
        });
        TestChatMessageRequestDto requestDto = new TestChatMessageRequestDto();
        requestDto.setContent(content);
        requestDto.setReelId(reelId);

        String sendDestination = String.format("/app/chat/%s/send", chatId);
        session.send(sendDestination, requestDto);

        ChatMessageDto receivedMessage = blockingQueue.poll(5, TimeUnit.SECONDS);

        assertThat(receivedMessage).isNotNull();
        assertThat(receivedMessage.getContent()).isEqualTo(content);
        assertThat(receivedMessage.getSender().getUsername()).isEqualTo(username);
    }

    static class TestChatMessageRequestDto {
        private String content;
        private Long reelId;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getReelId() { return reelId; }
        public void setReelId(Long reelId) { this.reelId = reelId; }
    }
}